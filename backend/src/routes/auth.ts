import { Router } from 'express';
import { AuthService } from '../services/authService';
import { validate } from '../middleware/validationMiddleware';
import { userRegistrationSchema, userLoginSchema } from '../validation/schemas';
import { logger } from '../utils/logger';

const router = Router();

router.post('/register', 
  validate(userRegistrationSchema),
  async (req, res) => {
    try {
      const result = await AuthService.register(req.body);
      res.status(201).json(result);
    } catch (error) {
      logger.error('Registration error:', error);
      if (error instanceof Error && error.message.includes('already exists')) {
        res.status(409).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Error registering user' });
      }
    }
});

router.post('/login',
  validate(userLoginSchema),
  async (req, res) => {
    try {
      const result = await AuthService.login(req.body);
      res.json(result);
    } catch (error) {
      logger.error('Login error:', error);
      res.status(401).json({ message: 'Invalid credentials' });
    }
});

export { router as authRoutes }; 