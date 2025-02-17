import { AppDataSource } from '../config/database';
import { logger } from '../utils/logger';

const initializeDatabase = async () => {
  try {
    await AppDataSource.initialize();
    logger.info('Running database migrations...');
    await AppDataSource.runMigrations();
    logger.info('Database migrations completed successfully');
    await AppDataSource.destroy();
  } catch (error) {
    logger.error('Error during database initialization:', error);
    throw error;
  }
};

initializeDatabase()
  .then(() => process.exit(0))
  .catch(() => process.exit(1)); 