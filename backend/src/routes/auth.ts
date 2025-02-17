import { Router } from 'express';
import { AuthService } from '../services/authService';
import { logger } from '../utils/logger';

const router = Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, role, specialization } = req.body;
    
    const result = await AuthService.register({
      email,
      password,
      firstName,
      lastName,
      role,
      specialization
    });

    res.status(201).json(result);
  } catch (error) {
    logger.error('Registration error:', error);
    if (error instanceof Error) {
      if (error.message === 'User already exists') {
        res.status(409).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await AuthService.login(email, password);
    res.json(result);
  } catch (error) {
    logger.error('Login error:', error);
    if (error instanceof Error) {
      if (error.message === 'User not found' || error.message === 'Invalid password') {
        res.status(401).json({ message: 'Invalid credentials' });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
});

export { router as authRoutes }; 