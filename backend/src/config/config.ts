import dotenv from 'dotenv';
dotenv.config();

export const config = {
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d',
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development',
}; 