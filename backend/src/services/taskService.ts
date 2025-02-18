import { AppDataSource } from '../config/database';
import { Task } from '../entities/Task';
import { Job, JobParticipant, JobParticipantRole } from '../entities/Job';
import { User } from '../entities/User';
import { logger } from '../utils/logger';

const taskRepository = AppDataSource.getRepository(Task);
const jobRepository = AppDataSource.getRepository(Job);
const participantRepository = AppDataSource.getRepository(JobParticipant);

export class TaskService {
  static async createTask(
    jobId: string,
    creatorId: string,
    taskData: {
      title: string;
      description: string;
      dueDate: Date;
      estimatedHours?: number;
      assignedToId?: string;
    }
  ): Promise<Task> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Check if creator is a participant of the job
      const participant = await participantRepository.findOne({
        where: {
          job: { id: jobId },
          user: { id: creatorId },
          isActive: true
        }
      });

      if (!participant || ![JobParticipantRole.MANAGER, JobParticipantRole.COORDINATOR].includes(participant.role)) {
        throw new Error('Not authorized to create tasks for this job');
      }

      // If assignedToId is provided, verify they are a job participant
      if (taskData.assignedToId) {
        const assigneeParticipant = await participantRepository.findOne({
          where: {
            job: { id: jobId },
            user: { id: taskData.assignedToId },
            isActive: true
          }
        });

        if (!assigneeParticipant) {
          throw new Error('Assigned user is not a participant of this job');
        }
      }

      const job = await jobRepository.findOneOrFail({ where: { id: jobId } });
      const creator = await AppDataSource.getRepository(User).findOneOrFail({ 
        where: { id: creatorId } 
      });

      let assignedTo = null;
      if (taskData.assignedToId) {
        assignedTo = await AppDataSource.getRepository(User).findOneOrFail({ 
          where: { id: taskData.assignedToId } 
        });
      }

      const task = taskRepository.create({
        title: taskData.title,
        description: taskData.description,
        dueDate: taskData.dueDate,
        estimatedHours: taskData.estimatedHours,
        job: job,
        createdBy: creator,
        assignedTo: assignedTo || undefined,
        status: 'pending'
      });

      const savedTask = await queryRunner.manager.save(task);
      await queryRunner.commitTransaction();

      return savedTask;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      logger.error('Error creating task:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  static async getJobTasks(jobId: string, userId: string): Promise<Task[]> {
    try {
      // Verify user is a participant
      const participant = await participantRepository.findOne({
        where: {
          job: { id: jobId },
          user: { id: userId },
          isActive: true
        }
      });

      if (!participant) {
        throw new Error('Not authorized to view tasks for this job');
      }

      return await taskRepository.find({
        where: { job: { id: jobId } },
        relations: ['assignedTo', 'createdBy']
      });
    } catch (error) {
      logger.error('Error fetching job tasks:', error);
      throw error;
    }
  }

  static async getTaskById(taskId: string, userId: string): Promise<Task> {
    try {
      const task = await taskRepository.findOne({
        where: { id: taskId },
        relations: ['job', 'assignedTo', 'createdBy']
      });

      if (!task) {
        throw new Error('Task not found');
      }

      // Verify user is a participant of the job
      const participant = await participantRepository.findOne({
        where: {
          job: { id: task.job.id },
          user: { id: userId },
          isActive: true
        }
      });

      if (!participant) {
        throw new Error('Not authorized to view this task');
      }

      return task;
    } catch (error) {
      logger.error('Error fetching task:', error);
      throw error;
    }
  }

  static async updateTask(
    taskId: string,
    userId: string,
    updateData: Partial<Task>
  ): Promise<Task> {
    try {
      const task = await taskRepository.findOne({
        where: { id: taskId },
        relations: ['job', 'assignedTo']
      });

      if (!task) {
        throw new Error('Task not found');
      }

      // Check user's role in the job
      const participant = await participantRepository.findOne({
        where: {
          job: { id: task.job.id },
          user: { id: userId },
          isActive: true
        }
      });

      if (!participant) {
        throw new Error('Not authorized to update this task');
      }

      // Only managers, coordinators, or assigned users can update tasks
      if (![JobParticipantRole.MANAGER, JobParticipantRole.COORDINATOR].includes(participant.role) &&
          task.assignedTo?.id !== userId) {
        throw new Error('Not authorized to update this task');
      }

      // If changing assignment, verify new assignee is a job participant
      if (updateData.assignedTo && updateData.assignedTo.id !== task.assignedTo?.id) {
        const newAssigneeParticipant = await participantRepository.findOne({
          where: {
            job: { id: task.job.id },
            user: { id: updateData.assignedTo.id },
            isActive: true
          }
        });

        if (!newAssigneeParticipant) {
          throw new Error('New assignee is not a participant of this job');
        }
      }

      Object.assign(task, updateData);
      return await taskRepository.save(task);
    } catch (error) {
      logger.error('Error updating task:', error);
      throw error;
    }
  }

  static async deleteTask(taskId: string, userId: string): Promise<void> {
    try {
      const task = await taskRepository.findOne({
        where: { id: taskId },
        relations: ['job']
      });

      if (!task) {
        throw new Error('Task not found');
      }

      // Only managers or coordinators can delete tasks
      const participant = await participantRepository.findOne({
        where: {
          job: { id: task.job.id },
          user: { id: userId },
          role: JobParticipantRole.MANAGER,
          isActive: true
        }
      });

      if (!participant) {
        throw new Error('Not authorized to delete this task');
      }

      await taskRepository.remove(task);
    } catch (error) {
      logger.error('Error deleting task:', error);
      throw error;
    }
  }
} 