import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authConfig } from '../config/auth';
import { logger } from '../utils/logger';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({ message: 'Authentication token required' });
      return;
    }

    jwt.verify(token, authConfig.jwtSecret, (err, decoded) => {
      if (err) {
        res.status(403).json({ message: 'Invalid or expired token' });
        return;
      }

      req.user = decoded as { id: string; email: string; role: string };
      next();
    });
  } catch (error) {
    logger.error('Error in auth middleware:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const authorizeRoles = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ message: 'Unauthorized access' });
      return;
    }

    next();
  };
}; 