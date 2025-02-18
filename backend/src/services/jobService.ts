import { AppDataSource } from '../config/database';
import { Job, JobParticipant, JobParticipantRole } from '../entities/Job';
import { User } from '../entities/User';
import { logger } from '../utils/logger';

const jobRepository = AppDataSource.getRepository(Job);
const participantRepository = AppDataSource.getRepository(JobParticipant);

export class JobService {
  static async createJob(jobData: {
    title: string;
    description: string;
    startDate: Date;
    dueDate: Date;
    estimatedHours?: number;
    budget?: number;
    location?: string;
    createdById: string;
    clientId: string;
  }): Promise<Job> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create the job
      const job = jobRepository.create({
        ...jobData,
        status: 'pending'
      });
      
      // Save the job first
      const savedJob = await queryRunner.manager.save(job);

      // Create the participant record for the creator (manager)
      const participant = participantRepository.create({
        job: savedJob,
        user: { id: jobData.createdById },
        role: JobParticipantRole.MANAGER,
        isActive: true
      });

      // Save the participant
      await queryRunner.manager.save(participant);

      // Commit the transaction
      await queryRunner.commitTransaction();
      
      return savedJob;
    } catch (error) {
      // Rollback the transaction on error
      await queryRunner.rollbackTransaction();
      logger.error('Error creating job:', error);
      throw error;
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
  }

  static async getJobs(userId: string): Promise<Job[]> {
    try {
      // Get all jobs where user is a participant
      const participants = await participantRepository.find({
        where: { user: { id: userId }, isActive: true },
        relations: ['job']
      });

      return participants.map(p => p.job);
    } catch (error) {
      logger.error('Error fetching jobs:', error);
      throw error;
    }
  }

  static async getJobById(jobId: string, userId: string): Promise<Job> {
    try {
      const participant = await participantRepository.findOne({
        where: { job: { id: jobId }, user: { id: userId }, isActive: true },
        relations: ['job', 'job.participants', 'job.tasks']
      });

      if (!participant) {
        throw new Error('Job not found or user not authorized');
      }

      return participant.job;
    } catch (error) {
      logger.error(`Error fetching job ${jobId}:`, error);
      throw error;
    }
  }

  static async updateJob(
    jobId: string, 
    userId: string, 
    updateData: Partial<Job>
  ): Promise<Job> {
    try {
      const participant = await participantRepository.findOne({
        where: { 
          job: { id: jobId }, 
          user: { id: userId }, 
          role: JobParticipantRole.MANAGER,
          isActive: true 
        }
      });

      if (!participant) {
        throw new Error('Not authorized to update this job');
      }

      await jobRepository.update(jobId, updateData);
      return await jobRepository.findOneOrFail({ where: { id: jobId } });
    } catch (error) {
      logger.error(`Error updating job ${jobId}:`, error);
      throw error;
    }
  }

  static async deleteJob(jobId: string, userId: string): Promise<void> {
    try {
      const participant = await participantRepository.findOne({
        where: { 
          job: { id: jobId }, 
          user: { id: userId }, 
          role: JobParticipantRole.MANAGER,
          isActive: true 
        }
      });

      if (!participant) {
        throw new Error('Not authorized to delete this job');
      }

      await jobRepository.delete(jobId);
    } catch (error) {
      logger.error(`Error deleting job ${jobId}:`, error);
      throw error;
    }
  }

  static async addParticipant(
    jobId: string,
    managerId: string,
    userId: string,
    role: JobParticipantRole
  ): Promise<JobParticipant> {
    try {
      // Verify manager has permission
      const managerParticipant = await participantRepository.findOne({
        where: { 
          job: { id: jobId }, 
          user: { id: managerId }, 
          role: JobParticipantRole.MANAGER,
          isActive: true 
        }
      });

      if (!managerParticipant) {
        throw new Error('Not authorized to add participants');
      }

      // Check if user is already a participant
      let participant = await participantRepository.findOne({
        where: { job: { id: jobId }, user: { id: userId } }
      });

      if (participant) {
        if (participant.isActive) {
          throw new Error('User is already a participant');
        }
        // Reactivate participant with new role
        participant.isActive = true;
        participant.role = role;
      } else {
        // Create new participant
        participant = participantRepository.create({
          job: { id: jobId },
          user: { id: userId },
          role
        });
      }

      return await participantRepository.save(participant);
    } catch (error) {
      logger.error(`Error adding participant to job ${jobId}:`, error);
      throw error;
    }
  }

  static async removeParticipant(
    jobId: string,
    managerId: string,
    userId: string
  ): Promise<void> {
    try {
      // Verify manager has permission
      const managerParticipant = await participantRepository.findOne({
        where: { 
          job: { id: jobId }, 
          user: { id: managerId }, 
          role: JobParticipantRole.MANAGER,
          isActive: true 
        }
      });

      if (!managerParticipant) {
        throw new Error('Not authorized to remove participants');
      }

      // Can't remove the manager
      const participant = await participantRepository.findOne({
        where: { job: { id: jobId }, user: { id: userId } }
      });

      if (!participant) {
        throw new Error('Participant not found');
      }

      if (participant.role === JobParticipantRole.MANAGER) {
        throw new Error('Cannot remove the job manager');
      }

      // Soft delete by setting isActive to false
      participant.isActive = false;
      await participantRepository.save(participant);
    } catch (error) {
      logger.error(`Error removing participant from job ${jobId}:`, error);
      throw error;
    }
  }
} 