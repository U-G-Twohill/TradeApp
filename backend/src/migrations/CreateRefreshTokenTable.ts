import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateRefreshTokenTable implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "refresh_token",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        generationStrategy: "uuid",
                        default: "uuid_generate_v4()"
                    },
                    {
                        name: "token",
                        type: "varchar",
                        isUnique: true
                    },
                    {
                        name: "revoked",
                        type: "boolean",
                        default: false
                    },
                    {
                        name: "expiresAt",
                        type: "timestamp"
                    },
                    {
                        name: "userId",
                        type: "uuid"
                    },
                    {
                        name: "createdAt",
                        type: "timestamp",
                        default: "now()"
                    },
                    {
                        name: "updatedAt",
                        type: "timestamp",
                        default: "now()"
                    }
                ]
            })
        );

        await queryRunner.createForeignKey(
            "refresh_token",
            new TableForeignKey({
                columnNames: ["userId"],
                referencedColumnNames: ["id"],
                referencedTableName: "user",
                onDelete: "CASCADE"
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("refresh_token");
    }
} 