/* eslint-disable */
import { MigrationInterface, QueryRunner } from "typeorm";

export class AddReferenceMessageIdToMessageEntity1732299758491 implements MigrationInterface {
    name = 'AddReferenceMessageIdToMessageEntity1732299758491'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "rcs"."messages" ADD "reference_message_id" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "rcs"."messages" DROP COLUMN "reference_message_id"`);
    }

}
