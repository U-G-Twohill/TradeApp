import bcrypt from 'bcryptjs';
import { sign, SignOptions, Secret } from 'jsonwebtoken';
import { User } from '../entities/User';
import { AppDataSource } from '../config/database';
import { authConfig } from '../config/auth';
import { logger } from '../utils/logger';
import { RefreshToken } from '../entities/RefreshToken';
import { config } from '../config/config';
import { v4 as uuidv4 } from 'uuid';

const userRepository = AppDataSource.getRepository(User);
const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);

const REFRESH_TOKEN_EXPIRY = 30 * 24 * 60 * 60 * 1000; // 30 days
const ACCESS_TOKEN_EXPIRY = '1h'; // 1 hour

interface JWTPayload {
  id: string;
  email: string;
  role: string;
}

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, authConfig.saltRounds);
  }

  static async comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  static generateToken(user: User): string {
    const payload: JWTPayload = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    return sign(
      payload,
      authConfig.jwtSecret as Secret,
      { expiresIn: authConfig.jwtExpiresIn } as SignOptions
    );
  }

  static async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
    specialization?: string;
  }): Promise<{ user: Partial<User>; accessToken: string; refreshToken: string }> {
    try {
      // Check if user already exists
      const existingUser = await userRepository.findOne({
        where: { email: userData.email }
      });

      if (existingUser) {
        throw new Error('User already exists');
      }

      // Hash password
      const hashedPassword = await this.hashPassword(userData.password);

      // Create new user
      const user = userRepository.create({
        ...userData,
        password: hashedPassword,
      });

      await userRepository.save(user);

      const { accessToken, refreshToken } = await this.generateTokens(user);

      // Create a new object without the password
      const userWithoutPassword: Partial<User> = { ...user };
      delete userWithoutPassword.password;

      return { user: userWithoutPassword, accessToken, refreshToken };
    } catch (error) {
      logger.error('Error in register service:', error);
      throw error;
    }
  }

  static async login(credentials: { email: string; password: string }): Promise<{ user: Partial<User>; accessToken: string; refreshToken: string }> {
    try {
      // Find user with password
      const user = await userRepository.findOne({
        where: { email: credentials.email },
        select: ['id', 'email', 'password', 'firstName', 'lastName', 'role']
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Verify password
      const isPasswordValid = await this.comparePasswords(credentials.password, user.password);
      if (!isPasswordValid) {
        throw new Error('Invalid password');
      }

      const { accessToken, refreshToken } = await this.generateTokens(user);

      // Create a new object without the password
      const userWithoutPassword: Partial<User> = { ...user };
      delete userWithoutPassword.password;

      return { user: userWithoutPassword, accessToken, refreshToken };
    } catch (error) {
      logger.error('Error in login service:', error);
      throw error;
    }
  }

  static async refreshToken(token: string): Promise<{ accessToken: string; refreshToken: string }> {
    const refreshToken = await refreshTokenRepository.findOne({
      where: { token },
      relations: ['user']
    });

    if (!refreshToken || refreshToken.revoked || refreshToken.isExpired()) {
      throw new Error('Invalid refresh token');
    }

    // Revoke the old refresh token
    refreshToken.revoked = true;
    await refreshTokenRepository.save(refreshToken);

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = await this.generateTokens(refreshToken.user);

    return { accessToken, refreshToken: newRefreshToken };
  }

  static async revokeToken(token: string) {
    const refreshToken = await refreshTokenRepository.findOne({
      where: { token }
    });

    if (refreshToken) {
      refreshToken.revoked = true;
      await refreshTokenRepository.save(refreshToken);
    }
  }

  private static async generateTokens(user: User) {
    const accessToken = sign(
      { userId: user.id, role: user.role },
      config.jwtSecret,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );

    const refreshToken = await this.createRefreshToken(user);

    return { accessToken, refreshToken };
  }

  private static async createRefreshToken(user: User): Promise<string> {
    const token = uuidv4();
    const refreshToken = refreshTokenRepository.create({
      token,
      user,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY)
    });

    await refreshTokenRepository.save(refreshToken);
    return token;
  }

  private static sanitizeUser(user: User) {
    const { password, ...sanitizedUser } = user;
    return sanitizedUser;
  }
} 