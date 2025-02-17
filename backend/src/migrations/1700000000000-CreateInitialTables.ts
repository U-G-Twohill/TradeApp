import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateInitialTables1700000000000 implements MigrationInterface {
    name = 'CreateInitialTables1700000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE user_role_enum AS ENUM ('tradesperson', 'contractor', 'project_manager');
            CREATE TYPE task_status_enum AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');

            CREATE TABLE "users" (
                "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                "firstName" VARCHAR(100) NOT NULL,
                "lastName" VARCHAR(100) NOT NULL,
                "email" VARCHAR NOT NULL UNIQUE,
                "password" VARCHAR NOT NULL,
                "role" user_role_enum NOT NULL DEFAULT 'tradesperson',
                "specialization" VARCHAR,
                "rating" DECIMAL(3,2) DEFAULT 0,
                "completedJobs" INTEGER DEFAULT 0,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
            );

            CREATE TABLE "tasks" (
                "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                "title" VARCHAR NOT NULL,
                "description" TEXT NOT NULL,
                "status" task_status_enum NOT NULL DEFAULT 'pending',
                "dueDate" DATE NOT NULL,
                "estimatedHours" DECIMAL(10,2),
                "assignedToId" UUID REFERENCES users(id),
                "createdById" UUID REFERENCES users(id),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
            );
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE "tasks";
            DROP TABLE "users";
            DROP TYPE task_status_enum;
            DROP TYPE user_role_enum;
        `);
    }
} 