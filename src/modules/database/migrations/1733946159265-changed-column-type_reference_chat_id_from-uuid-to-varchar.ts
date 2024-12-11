/* eslint-disable */
import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangedColumnTypeReferenceChatIdFromUuidToVarchar1733946159265 implements MigrationInterface {
    name = 'ChangedColumnTypeReferenceChatIdFromUuidToVarchar1733946159265'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "rcs"."idx_chats_reference_chat_id"`);
        await queryRunner.query(`ALTER TABLE "rcs"."chats" DROP COLUMN "reference_chat_id"`);
        await queryRunner.query(`ALTER TABLE "rcs"."chats" ADD "reference_chat_id" character varying NOT NULL`);
        await queryRunner.query(`CREATE INDEX "idx_chats_reference_chat_id" ON "rcs"."chats" ("reference_chat_id") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "rcs"."idx_chats_reference_chat_id"`);
        await queryRunner.query(`ALTER TABLE "rcs"."chats" DROP COLUMN "reference_chat_id"`);
        await queryRunner.query(`ALTER TABLE "rcs"."chats" ADD "reference_chat_id" uuid NOT NULL`);
        await queryRunner.query(`CREATE INDEX "idx_chats_reference_chat_id" ON "rcs"."chats" ("reference_chat_id") `);
    }

}
