/* eslint-disable */
import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateIndexIdxMessagesRecipient1734476784674 implements MigrationInterface {
    name = 'CreateIndexIdxMessagesRecipient1734476784674'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX "idx_messages_recipient" ON "rcs"."messages" ("recipient") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "rcs"."idx_messages_recipient"`);
    }

}
