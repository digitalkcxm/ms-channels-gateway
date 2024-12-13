/* eslint-disable */
import { MigrationInterface, QueryRunner } from "typeorm";

export class TemplateLinksUniqueReferenceTemplate1733767805892 implements MigrationInterface {
    name = 'TemplateLinksUniqueReferenceTemplate1733767805892'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "template_links" ADD CONSTRAINT "uq_template_links_template_id_reference_id" UNIQUE ("reference_id", "template_id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "template_links" DROP CONSTRAINT "uq_template_links_template_id_reference_id"`);
    }
}
