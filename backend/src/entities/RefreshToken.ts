import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './User';

@Entity()
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  token!: string;

  @Column({ default: false })
  revoked!: boolean;

  @Column({ type: 'timestamp' })
  expiresAt!: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user!: User;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  isExpired(): boolean {
    return this.expiresAt < new Date();
  }
} 