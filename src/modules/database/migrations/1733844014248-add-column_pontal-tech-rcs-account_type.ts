/* eslint-disable */
import { MigrationInterface, QueryRunner } from "typeorm";

export class AddColumnPontalTechRcsAccountType1733844014248 implements MigrationInterface {
    name = 'AddColumnPontalTechRcsAccountType1733844014248'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "rcs"."pontal_tech_rcs_account_type" AS ENUM('basic', 'single')`);
        await queryRunner.query(`ALTER TABLE "rcs"."pontal_tech_rcs_accounts" ADD "pontal_tech_account_type" "rcs"."pontal_tech_rcs_account_type" NOT NULL DEFAULT 'single'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "rcs"."pontal_tech_rcs_accounts" DROP COLUMN "pontal_tech_account_type"`);
        await queryRunner.query(`DROP TYPE "rcs"."pontal_tech_rcs_account_type"`);
    }

}
