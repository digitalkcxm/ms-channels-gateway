/* eslint-disable */
import { MigrationInterface, QueryRunner } from "typeorm";

export class TemplatesStructure1733499202418 implements MigrationInterface {
    name = 'TemplatesStructure1733499202418'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "template_links" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "template_id" uuid NOT NULL, "reference_id" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "pk_template_links_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "ix_template_links_reference_id" ON "template_links" ("reference_id") `);
        await queryRunner.query(`CREATE INDEX "ix_template_links_template_id" ON "template_links" ("template_id") `);
        await queryRunner.query(`CREATE TYPE "public"."template_content_type" AS ENUM('text', 'rich-card', 'carousel')`);
        await queryRunner.query(`CREATE TABLE "templates" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying, "company_token" character varying NOT NULL, "external_id" character varying, "channel" "public"."channel_type" NOT NULL, "content_type" "public"."template_content_type" NOT NULL, "content" jsonb NOT NULL, "variables" jsonb, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "pk_templates_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "ix_templates_company_token" ON "templates" ("company_token") `);
        await queryRunner.query(`CREATE INDEX "ix_templates_content_type" ON "templates" ("content_type") `);
        await queryRunner.query(`CREATE INDEX "ix_templates_channel" ON "templates" ("channel") `);
        await queryRunner.query(`ALTER TABLE "template_links" ADD CONSTRAINT "fk_template_links_template_id" FOREIGN KEY ("template_id") REFERENCES "templates"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "template_links" DROP CONSTRAINT "fk_template_links_template_id"`);
        await queryRunner.query(`DROP INDEX "public"."ix_templates_channel"`);
        await queryRunner.query(`DROP INDEX "public"."ix_templates_content_type"`);
        await queryRunner.query(`DROP INDEX "public"."ix_templates_company_token"`);
        await queryRunner.query(`DROP TABLE "templates"`);
        await queryRunner.query(`DROP TYPE "public"."template_content_type"`);
        await queryRunner.query(`DROP INDEX "public"."ix_template_links_template_id"`);
        await queryRunner.query(`DROP INDEX "public"."ix_template_links_reference_id"`);
        await queryRunner.query(`DROP TABLE "template_links"`);
    }

}
