import { Router } from 'express';
import { UserService } from '../services/userService';
import { authenticateToken, authorizeRoles, AuthRequest } from '../middleware/authMiddleware';
import { logger } from '../utils/logger';

const router = Router();

// Get all users
router.get('/', authenticateToken, async (req, res) => {
  try {
    const users = await UserService.getUsers();
    res.json(users);
  } catch (error) {
    logger.error('Error in get users route:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const user = await UserService.getUserById(req.params.id);
    res.json(user);
  } catch (error) {
    logger.error('Error in get user route:', error);
    if (error instanceof Error && error.message === 'User not found') {
      res.status(404).json({ message: 'User not found' });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
});

// Update user
router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    // Only allow users to update their own profile, unless they're an admin
    if (req.user?.id !== req.params.id && req.user?.role !== 'project_manager') {
      return res.status(403).json({ message: 'Unauthorized to update this user' });
    }

    const updatedUser = await UserService.updateUser(req.params.id, req.body);
    res.json(updatedUser);
  } catch (error) {
    logger.error('Error in update user route:', error);
    if (error instanceof Error && error.message === 'User not found') {
      res.status(404).json({ message: 'User not found' });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
});

// Delete user
router.delete('/:id', authenticateToken, authorizeRoles('project_manager'), async (req, res) => {
  try {
    await UserService.deleteUser(req.params.id);
    res.status(204).send();
  } catch (error) {
    logger.error('Error in delete user route:', error);
    if (error instanceof Error && error.message === 'User not found') {
      res.status(404).json({ message: 'User not found' });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
});

export { router as userRoutes }; 