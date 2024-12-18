/* eslint-disable */
import { MigrationInterface, QueryRunner } from "typeorm";

export class AddColumnReceivedAtToMessageEntity1734540181931 implements MigrationInterface {
    name = 'AddColumnReceivedAtToMessageEntity1734540181931'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "rcs"."messages" ADD "received_at" TIMESTAMP DEFAULT 'now()'`);
        await queryRunner.query(`CREATE INDEX "idx_messages_broker_message_id" ON "rcs"."messages" ("broker_message_id") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "rcs"."idx_messages_broker_message_id"`);
        await queryRunner.query(`ALTER TABLE "rcs"."messages" DROP COLUMN "received_at"`);
    }

}
