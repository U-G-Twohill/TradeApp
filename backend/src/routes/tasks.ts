import { Router } from 'express';
import { TaskService } from '../services/taskService';
import { authenticateToken, AuthRequest } from '../middleware/authMiddleware';
import { validate } from '../middleware/validationMiddleware';
import { taskCreationSchema, taskUpdateSchema } from '../validation/schemas';
import { logger } from '../utils/logger';
import { taskCreationLimiter } from '../config/rateLimit';

const router = Router();

/**
 * @swagger
 * /jobs/{jobId}/tasks:
 *   post:
 *     summary: Create a new task for a job
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - dueDate
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 200
 *               description:
 *                 type: string
 *                 minLength: 10
 *               dueDate:
 *                 type: string
 *                 format: date
 *               estimatedHours:
 *                 type: number
 *               assignedToId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Task created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized to create tasks
 */
router.post('/jobs/:jobId/tasks', 
  authenticateToken,
  taskCreationLimiter,
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

/**
 * @swagger
 * /jobs/{jobId}/tasks:
 *   get:
 *     summary: Get all tasks for a job
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: List of tasks for the job
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized to view tasks
 *       404:
 *         description: Job not found
 */
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

/**
 * @swagger
 * /tasks/{id}:
 *   get:
 *     summary: Get a specific task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Task details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized to view this task
 *       404:
 *         description: Task not found
 */
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

/**
 * @swagger
 * /tasks/{id}:
 *   put:
 *     summary: Update a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 200
 *               description:
 *                 type: string
 *                 minLength: 10
 *               status:
 *                 type: string
 *                 enum: [pending, in_progress, completed, cancelled]
 *               dueDate:
 *                 type: string
 *                 format: date
 *               estimatedHours:
 *                 type: number
 *               assignedToId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Task updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized to update task
 *       404:
 *         description: Task not found
 */
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

/**
 * @swagger
 * /tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Task deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized to delete this task
 *       404:
 *         description: Task not found
 */
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