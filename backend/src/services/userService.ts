import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { logger } from '../utils/logger';

const userRepository = AppDataSource.getRepository(User);

export class UserService {
  static async getUsers(): Promise<Partial<User>[]> {
    try {
      const users = await userRepository.find({
        select: ['id', 'email', 'firstName', 'lastName', 'role', 'specialization', 'rating', 'completedJobs']
      });
      return users;
    } catch (error) {
      logger.error('Error fetching users:', error);
      throw error;
    }
  }

  static async getUserById(id: string): Promise<Partial<User>> {
    try {
      const user = await userRepository.findOne({
        where: { id },
        select: ['id', 'email', 'firstName', 'lastName', 'role', 'specialization', 'rating', 'completedJobs']
      });

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error) {
      logger.error(`Error fetching user ${id}:`, error);
      throw error;
    }
  }

  static async updateUser(id: string, updateData: Partial<User>): Promise<Partial<User>> {
    try {
      const user = await userRepository.findOne({ where: { id } });

      if (!user) {
        throw new Error('User not found');
      }

      // Remove sensitive fields from update data
      delete updateData.password;
      delete updateData.id;

      // Update user
      Object.assign(user, updateData);
      await userRepository.save(user);

      // Return user without password
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      logger.error(`Error updating user ${id}:`, error);
      throw error;
    }
  }

  static async deleteUser(id: string): Promise<void> {
    try {
      const user = await userRepository.findOne({ where: { id } });

      if (!user) {
        throw new Error('User not found');
      }

      await userRepository.remove(user);
    } catch (error) {
      logger.error(`Error deleting user ${id}:`, error);
      throw error;
    }
  }
} 