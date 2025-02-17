import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';
import { User } from './User';

@Entity('tasks')
export class Task {
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
  dueDate!: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  estimatedHours!: number;

  @ManyToOne(() => User, { eager: true })
  assignedTo!: User;

  @ManyToOne(() => User, { eager: true })
  createdBy!: User;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
} 