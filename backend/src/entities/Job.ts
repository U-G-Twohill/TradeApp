import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable
} from 'typeorm';
import { User } from './User';
import { Task } from './Task';

// Define the possible roles in a job
export enum JobParticipantRole {
  MANAGER = 'manager',          // Can edit job details, assign users, approve/reject work
  COORDINATOR = 'coordinator',  // Can assign tasks, update status, but can't edit core job details
  WORKER = 'worker',           // Can view job and work on assigned tasks
  CLIENT = 'client'            // Can view progress and provide feedback
}

@Entity('jobs')
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column('text')
  description!: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  })
  status!: string;

  @Column({ type: 'date' })
  startDate!: Date;

  @Column({ type: 'date' })
  dueDate!: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  estimatedHours!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  budget!: number;

  @Column({ type: 'text', nullable: true })
  location!: string;

  // The user who created the job (automatically becomes the manager)
  @ManyToOne(() => User, { eager: true })
  createdBy!: User;

  // Client for whom the job is being done
  @ManyToOne(() => User, { eager: true })
  client!: User;

  @OneToMany(() => JobParticipant, participant => participant.job)
  participants!: JobParticipant[];

  @OneToMany(() => Task, task => task.job)
  tasks!: Task[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

@Entity('job_participants')
export class JobParticipant {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Job, job => job.participants)
  job!: Job;

  @ManyToOne(() => User, { eager: true })
  user!: User;

  @Column({
    type: 'enum',
    enum: JobParticipantRole,
    default: JobParticipantRole.WORKER
  })
  role!: JobParticipantRole;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  joinedAt!: Date;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;
} 