import { config } from 'dotenv';
import { Secret } from 'jsonwebtoken';

config();

export const authConfig = {
  jwtSecret: process.env.JWT_SECRET as Secret || 'your-default-secret-key',
  jwtExpiresIn: '24h',
  saltRounds: 10
}; 