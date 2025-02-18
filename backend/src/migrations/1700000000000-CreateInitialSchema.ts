import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateInitialSchema1700000000000 implements MigrationInterface {
    name = 'CreateInitialSchema1700000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            -- Create ENUMs
            CREATE TYPE user_role_enum AS ENUM ('tradesperson', 'contractor', 'project_manager');
            CREATE TYPE task_status_enum AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');
            CREATE TYPE job_status_enum AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');
            CREATE TYPE job_participant_role_enum AS ENUM ('manager', 'coordinator', 'worker', 'client');

            -- Create Users table
            CREATE TABLE "users" (
                "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                "email" VARCHAR UNIQUE NOT NULL,
                "password" VARCHAR NOT NULL,
                "firstName" VARCHAR(100) NOT NULL,
                "lastName" VARCHAR(100) NOT NULL,
                "role" user_role_enum NOT NULL DEFAULT 'tradesperson',
                "specialization" VARCHAR,
                "rating" DECIMAL(3,2) DEFAULT 0,
                "completedJobs" INTEGER DEFAULT 0,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
            );

            -- Create Jobs table
            CREATE TABLE "jobs" (
                "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                "title" VARCHAR NOT NULL,
                "description" TEXT NOT NULL,
                "status" job_status_enum NOT NULL DEFAULT 'pending',
                "startDate" DATE NOT NULL,
                "dueDate" DATE NOT NULL,
                "estimatedHours" DECIMAL(10,2),
                "budget" DECIMAL(10,2),
                "location" TEXT,
                "createdById" UUID REFERENCES users(id),
                "clientId" UUID REFERENCES users(id),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
            );

            -- Create Job Participants table
            CREATE TABLE "job_participants" (
                "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                "jobId" UUID REFERENCES jobs(id) ON DELETE CASCADE,
                "userId" UUID REFERENCES users(id) ON DELETE CASCADE,
                "role" job_participant_role_enum NOT NULL DEFAULT 'worker',
                "joinedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "isActive" BOOLEAN NOT NULL DEFAULT true
            );

            -- Create Tasks table
            CREATE TABLE "tasks" (
                "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                "title" VARCHAR NOT NULL,
                "description" TEXT NOT NULL,
                "status" task_status_enum NOT NULL DEFAULT 'pending',
                "dueDate" DATE NOT NULL,
                "estimatedHours" DECIMAL(10,2),
                "jobId" UUID REFERENCES jobs(id) ON DELETE CASCADE,
                "assignedToId" UUID REFERENCES users(id),
                "createdById" UUID REFERENCES users(id),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
            );

            -- Create indexes
            CREATE INDEX "idx_job_participants_job" ON "job_participants"("jobId");
            CREATE INDEX "idx_job_participants_user" ON "job_participants"("userId");
            CREATE UNIQUE INDEX "idx_unique_job_user" ON "job_participants"("jobId", "userId");
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE IF EXISTS "tasks";
            DROP TABLE IF EXISTS "job_participants";
            DROP TABLE IF EXISTS "jobs";
            DROP TABLE IF EXISTS "users";
            DROP TYPE IF EXISTS job_participant_role_enum;
            DROP TYPE IF EXISTS job_status_enum;
            DROP TYPE IF EXISTS task_status_enum;
            DROP TYPE IF EXISTS user_role_enum;
        `);
    }
} 