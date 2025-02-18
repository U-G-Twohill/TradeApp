import { Router } from 'express';
import { JobService } from '../services/jobService';
import { authenticateToken, AuthRequest } from '../middleware/authMiddleware';
import { validate } from '../middleware/validationMiddleware';
import { 
  jobCreationSchema, 
  jobUpdateSchema, 
  jobParticipantSchema 
} from '../validation/schemas';
import { logger } from '../utils/logger';
import { JobParticipantRole } from '../entities/Job';
import { jobCreationLimiter } from '../config/rateLimit';

const router = Router();

/**
 * @swagger
 * /jobs:
 *   post:
 *     summary: Create a new job
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - startDate
 *               - dueDate
 *               - clientId
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 200
 *               description:
 *                 type: string
 *                 minLength: 10
 *               startDate:
 *                 type: string
 *                 format: date
 *               dueDate:
 *                 type: string
 *                 format: date
 *               estimatedHours:
 *                 type: number
 *               budget:
 *                 type: number
 *               location:
 *                 type: string
 *               clientId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Job created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Job'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/', 
  authenticateToken,
  jobCreationLimiter,
  validate(jobCreationSchema),
  async (req: AuthRequest, res) => {
    try {
      const jobData = {
        ...req.body,
        createdById: req.user!.id
      };
      const job = await JobService.createJob(jobData);
      res.status(201).json(job);
    } catch (error) {
      logger.error('Error creating job:', error);
      res.status(500).json({ message: 'Error creating job' });
    }
});

/**
 * @swagger
 * /jobs:
 *   get:
 *     summary: Get all jobs for the current user
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of jobs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Job'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const jobs = await JobService.getJobs(req.user!.id);
    res.json(jobs);
  } catch (error) {
    logger.error('Error fetching jobs:', error);
    res.status(500).json({ message: 'Error fetching jobs' });
  }
});

/**
 * @swagger
 * /jobs/{id}:
 *   get:
 *     summary: Get a specific job by ID
 *     tags: [Jobs]
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
 *         description: Job details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Job'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Job not found
 */
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const job = await JobService.getJobById(req.params.id, req.user!.id);
    res.json(job);
  } catch (error) {
    logger.error('Error fetching job:', error);
    if (error instanceof Error && error.message.includes('not found')) {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Error fetching job' });
    }
  }
});

/**
 * @swagger
 * /jobs/{id}:
 *   put:
 *     summary: Update a job
 *     tags: [Jobs]
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
 *               startDate:
 *                 type: string
 *                 format: date
 *               dueDate:
 *                 type: string
 *                 format: date
 *               estimatedHours:
 *                 type: number
 *               budget:
 *                 type: number
 *               location:
 *                 type: string
 *     responses:
 *       200:
 *         description: Job updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Job'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized to update this job
 *       404:
 *         description: Job not found
 */
router.put('/:id', 
  authenticateToken,
  validate(jobUpdateSchema),
  async (req: AuthRequest, res) => {
    try {
      const job = await JobService.updateJob(req.params.id, req.user!.id, req.body);
      res.json(job);
    } catch (error) {
      logger.error('Error updating job:', error);
      if (error instanceof Error && error.message.includes('Not authorized')) {
        res.status(403).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Error updating job' });
      }
    }
});

/**
 * @swagger
 * /jobs/{id}:
 *   delete:
 *     summary: Delete a job
 *     tags: [Jobs]
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
 *         description: Job deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized to delete this job
 *       404:
 *         description: Job not found
 */
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    await JobService.deleteJob(req.params.id, req.user!.id);
    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting job:', error);
    if (error instanceof Error && error.message.includes('Not authorized')) {
      res.status(403).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Error deleting job' });
    }
  }
});

/**
 * @swagger
 * /jobs/{id}/participants:
 *   post:
 *     summary: Add a participant to a job
 *     tags: [Jobs]
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
 *             required:
 *               - userId
 *               - role
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *               role:
 *                 type: string
 *                 enum: [manager, coordinator, worker, client]
 *     responses:
 *       201:
 *         description: Participant added successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized to add participants
 *       404:
 *         description: Job or user not found
 */
router.post('/:id/participants', 
  authenticateToken,
  validate(jobParticipantSchema),
  async (req: AuthRequest, res) => {
    try {
      const participant = await JobService.addParticipant(
        req.params.id,
        req.user!.id,
        req.body.userId,
        req.body.role
      );
      res.status(201).json(participant);
    } catch (error) {
      logger.error('Error adding participant:', error);
      if (error instanceof Error && error.message.includes('Not authorized')) {
        res.status(403).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Error adding participant' });
      }
    }
});

/**
 * @swagger
 * /jobs/{id}/participants/{userId}:
 *   delete:
 *     summary: Remove a participant from a job
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Participant removed successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized to remove participants
 *       404:
 *         description: Job or participant not found
 */
router.delete('/:id/participants/:userId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    await JobService.removeParticipant(
      req.params.id,
      req.user!.id,
      req.params.userId
    );
    res.status(204).send();
  } catch (error) {
    logger.error('Error removing participant:', error);
    if (error instanceof Error && error.message.includes('Not authorized')) {
      res.status(403).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Error removing participant' });
    }
  }
});

export { router as jobRoutes }; 