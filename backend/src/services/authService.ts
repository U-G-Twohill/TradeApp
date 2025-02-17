import bcrypt from 'bcryptjs';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { User } from '../entities/User';
import { AppDataSource } from '../config/database';
import { authConfig } from '../config/auth';
import { logger } from '../utils/logger';

const userRepository = AppDataSource.getRepository(User);

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

    return jwt.sign(
      payload,
      authConfig.jwtSecret,
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
  }): Promise<{ user: Partial<User>; token: string }> {
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

      // Generate token
      const token = this.generateToken(user);

      // Create a new object without the password
      const userWithoutPassword: Partial<User> = { ...user };
      delete userWithoutPassword.password;

      return { user: userWithoutPassword, token };
    } catch (error) {
      logger.error('Error in register service:', error);
      throw error;
    }
  }

  static async login(email: string, password: string): Promise<{ user: Partial<User>; token: string }> {
    try {
      // Find user with password
      const user = await userRepository.findOne({
        where: { email },
        select: ['id', 'email', 'password', 'firstName', 'lastName', 'role']
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Verify password
      const isPasswordValid = await this.comparePasswords(password, user.password);
      if (!isPasswordValid) {
        throw new Error('Invalid password');
      }

      // Generate token
      const token = this.generateToken(user);

      // Create a new object without the password
      const userWithoutPassword: Partial<User> = { ...user };
      delete userWithoutPassword.password;

      return { user: userWithoutPassword, token };
    } catch (error) {
      logger.error('Error in login service:', error);
      throw error;
    }
  }
} 