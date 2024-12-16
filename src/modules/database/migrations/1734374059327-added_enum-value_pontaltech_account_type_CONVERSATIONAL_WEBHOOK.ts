/* eslint-disable */
import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedEnumValuePontaltechAccountTypeCONVERSATIONALWEBHOOK1734374059327 implements MigrationInterface {
    name = 'AddedEnumValuePontaltechAccountTypeCONVERSATIONALWEBHOOK1734374059327'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "rcs"."pontal_tech_rcs_accounts" DROP CONSTRAINT "fk_pontal_tech_rcs_account_rcs_accounts_id"`);
        await queryRunner.query(`ALTER TABLE "rcs"."pontal_tech_rcs_accounts" ADD CONSTRAINT "UQ_99f2dbaaff9f7afb7f57063722d" UNIQUE ("rcs_account_id")`);
        await queryRunner.query(`ALTER TYPE "rcs"."pontal_tech_rcs_account_type" RENAME TO "pontal_tech_rcs_account_type_old"`);
        await queryRunner.query(`CREATE TYPE "rcs"."pontal_tech_rcs_account_type" AS ENUM('basic', 'single', 'conversational-webhook')`);
        await queryRunner.query(`ALTER TABLE "rcs"."pontal_tech_rcs_accounts" ALTER COLUMN "pontal_tech_account_type" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "rcs"."pontal_tech_rcs_accounts" ALTER COLUMN "pontal_tech_account_type" TYPE "rcs"."pontal_tech_rcs_account_type" USING "pontal_tech_account_type"::"text"::"rcs"."pontal_tech_rcs_account_type"`);
        await queryRunner.query(`ALTER TABLE "rcs"."pontal_tech_rcs_accounts" ALTER COLUMN "pontal_tech_account_type" SET DEFAULT 'single'`);
        await queryRunner.query(`DROP TYPE "rcs"."pontal_tech_rcs_account_type_old"`);
        await queryRunner.query(`ALTER TABLE "rcs"."pontal_tech_rcs_accounts" ADD CONSTRAINT "fk_pontal_tech_rcs_account_rcs_accounts_id" FOREIGN KEY ("rcs_account_id") REFERENCES "rcs"."rcs_accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "rcs"."pontal_tech_rcs_accounts" DROP CONSTRAINT "fk_pontal_tech_rcs_account_rcs_accounts_id"`);
        await queryRunner.query(`CREATE TYPE "rcs"."pontal_tech_rcs_account_type_old" AS ENUM('basic', 'single')`);
        await queryRunner.query(`ALTER TABLE "rcs"."pontal_tech_rcs_accounts" ALTER COLUMN "pontal_tech_account_type" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "rcs"."pontal_tech_rcs_accounts" ALTER COLUMN "pontal_tech_account_type" TYPE "rcs"."pontal_tech_rcs_account_type_old" USING "pontal_tech_account_type"::"text"::"rcs"."pontal_tech_rcs_account_type_old"`);
        await queryRunner.query(`ALTER TABLE "rcs"."pontal_tech_rcs_accounts" ALTER COLUMN "pontal_tech_account_type" SET DEFAULT 'single'`);
        await queryRunner.query(`DROP TYPE "rcs"."pontal_tech_rcs_account_type"`);
        await queryRunner.query(`ALTER TYPE "rcs"."pontal_tech_rcs_account_type_old" RENAME TO "pontal_tech_rcs_account_type"`);
        await queryRunner.query(`ALTER TABLE "rcs"."pontal_tech_rcs_accounts" DROP CONSTRAINT "UQ_99f2dbaaff9f7afb7f57063722d"`);
        await queryRunner.query(`ALTER TABLE "rcs"."pontal_tech_rcs_accounts" ADD CONSTRAINT "fk_pontal_tech_rcs_account_rcs_accounts_id" FOREIGN KEY ("rcs_account_id") REFERENCES "rcs"."rcs_accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
