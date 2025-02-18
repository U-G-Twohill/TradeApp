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

const router = Router();

// Create job
router.post('/', 
  authenticateToken,
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

// Get all jobs for user
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const jobs = await JobService.getJobs(req.user!.id);
    res.json(jobs);
  } catch (error) {
    logger.error('Error fetching jobs:', error);
    res.status(500).json({ message: 'Error fetching jobs' });
  }
});

// Get job by ID
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

// Update job
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

// Delete job
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

// Add participant to job
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

// Remove participant from job
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