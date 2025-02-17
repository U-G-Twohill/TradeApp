import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn 
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 100 })
  firstName!: string;

  @Column({ length: 100 })
  lastName!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ select: false }) // Password won't be selected by default
  password!: string;

  @Column({ 
    type: 'enum', 
    enum: ['tradesperson', 'contractor', 'project_manager'],
    default: 'tradesperson'
  })
  role!: string;

  @Column({ nullable: true })
  specialization!: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating!: number;

  @Column({ default: 0 })
  completedJobs!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
} 