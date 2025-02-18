import rateLimit from 'express-rate-limit';
import { logger } from '../utils/logger';

// General API rate limit
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { message: 'Too many requests from this IP, please try again later' },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({ message: 'Too many requests from this IP, please try again later' });
  }
});

// More strict limit for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 login attempts per hour
  message: { message: 'Too many login attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Auth rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({ message: 'Too many login attempts, please try again later' });
  }
});

// Limit for job creation
export const jobCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 job creations per hour
  message: { message: 'Job creation limit reached, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Job creation rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({ message: 'Job creation limit reached, please try again later' });
  }
});

// Limit for task creation
export const taskCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30, // Limit each IP to 30 task creations per hour
  message: { message: 'Task creation limit reached, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Task creation rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({ message: 'Task creation limit reached, please try again later' });
  }
}); 