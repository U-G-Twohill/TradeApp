import { Router } from 'express';
import { TaskService } from '../services/taskService';
import { authenticateToken, AuthRequest } from '../middleware/authMiddleware';
import { validate } from '../middleware/validationMiddleware';
import { taskCreationSchema, taskUpdateSchema } from '../validation/schemas';
import { logger } from '../utils/logger';

const router = Router();

// Create task for a job
router.post('/jobs/:jobId/tasks', 
  authenticateToken,
  validate(taskCreationSchema),
  async (req: AuthRequest, res) => {
    try {
      const task = await TaskService.createTask(
        req.params.jobId,
        req.user!.id,
        req.body
      );
      res.status(201).json(task);
    } catch (error) {
      logger.error('Error creating task:', error);
      if (error instanceof Error && error.message.includes('Not authorized')) {
        res.status(403).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Error creating task' });
      }
    }
});

// Get all tasks for a job
router.get('/jobs/:jobId/tasks', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const tasks = await TaskService.getJobTasks(req.params.jobId, req.user!.id);
    res.json(tasks);
  } catch (error) {
    logger.error('Error fetching tasks:', error);
    if (error instanceof Error && error.message.includes('Not authorized')) {
      res.status(403).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Error fetching tasks' });
    }
  }
});

// Get specific task
router.get('/tasks/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const task = await TaskService.getTaskById(req.params.id, req.user!.id);
    res.json(task);
  } catch (error) {
    logger.error('Error fetching task:', error);
    if (error instanceof Error) {
      if (error.message.includes('Not authorized')) {
        res.status(403).json({ message: error.message });
      } else if (error.message.includes('not found')) {
        res.status(404).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Error fetching task' });
      }
    }
  }
});

// Update task
router.put('/tasks/:id', 
  authenticateToken,
  validate(taskUpdateSchema),
  async (req: AuthRequest, res) => {
    try {
      const task = await TaskService.updateTask(
        req.params.id,
        req.user!.id,
        req.body
      );
      res.json(task);
    } catch (error) {
      logger.error('Error updating task:', error);
      if (error instanceof Error) {
        if (error.message.includes('Not authorized')) {
          res.status(403).json({ message: error.message });
        } else if (error.message.includes('not found')) {
          res.status(404).json({ message: error.message });
        } else {
          res.status(500).json({ message: 'Error updating task' });
        }
      }
    }
});

// Delete task
router.delete('/tasks/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    await TaskService.deleteTask(req.params.id, req.user!.id);
    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting task:', error);
    if (error instanceof Error) {
      if (error.message.includes('Not authorized')) {
        res.status(403).json({ message: error.message });
      } else if (error.message.includes('not found')) {
        res.status(404).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Error deleting task' });
      }
    }
  }
});

export { router as taskRoutes }; 