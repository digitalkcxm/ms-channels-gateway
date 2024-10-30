/* eslint-disable */
import { MigrationInterface, QueryRunner } from "typeorm";

export class ChannelsAndRcsStructures1730297543444 implements MigrationInterface {
    name = 'ChannelsAndRcsStructures1730297543444'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "rcs"."pontal_tech_rcs_accounts" ("rcs_account_id" uuid NOT NULL, "api_key" character varying NOT NULL, "pontal_tech_account_id" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "uq_pontal_tech_rcs_account_rcs_account_id" UNIQUE ("rcs_account_id"), CONSTRAINT "pk_pontal_tech_rcs_accounts_rcs_account_id" PRIMARY KEY ("rcs_account_id"))`);
        await queryRunner.query(`CREATE INDEX "idx_pontal_tech_rcs_account_reference_id" ON "rcs"."pontal_tech_rcs_accounts" ("rcs_account_id") `);
        await queryRunner.query(`CREATE TABLE "rcs"."rcs_accounts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "reference_id" character varying NOT NULL, "broker" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "pk_rcs_accounts_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_rcs_account_reference_id" ON "rcs"."rcs_accounts" ("reference_id") `);
        await queryRunner.query(`CREATE TABLE "rcs"."chats" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "reference_chat_id" uuid NOT NULL, "rcs_account_id" uuid, "broker_chat_id" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "pk_chats_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_chats_reference_chat_id" ON "rcs"."chats" ("reference_chat_id") `);
        await queryRunner.query(`CREATE INDEX "idx_chats_rcs_broker_chat_id" ON "rcs"."chats" ("broker_chat_id") `);
        await queryRunner.query(`CREATE TYPE "rcs"."message_direction" AS ENUM('inbound', 'outbound')`);
        await queryRunner.query(`CREATE TYPE "rcs"."message_status" AS ENUM('queued', 'sent', 'delivered', 'read', 'error')`);
        await queryRunner.query(`CREATE TABLE "rcs"."messages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "chat_id" uuid NOT NULL, "broker_message_id" character varying, "recipient" character varying NOT NULL, "direction" "rcs"."message_direction" NOT NULL, "status" "rcs"."message_status" NOT NULL DEFAULT 'queued', "error_message" character varying, "raw_message" jsonb NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "pk_messages_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_messages_chat_id" ON "rcs"."messages" ("chat_id") `);
        await queryRunner.query(`CREATE TYPE "public"."channel_type" AS ENUM('rcs')`);
        await queryRunner.query(`CREATE TYPE "public"."broker_type" AS ENUM('pontal-tech')`);
        await queryRunner.query(`CREATE TYPE "public"."channel_config_status" AS ENUM('active', 'draft', 'inactive')`);
        await queryRunner.query(`CREATE TABLE "channel_configs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "company_token" character varying NOT NULL, "name" character varying NOT NULL DEFAULT 'No name', "description" character varying, "channel" "public"."channel_type" NOT NULL, "broker" "public"."broker_type" NOT NULL, "status" "public"."channel_config_status" NOT NULL DEFAULT 'draft', CONSTRAINT "pk_channel_configs_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_channel_configs_company_token" ON "channel_configs" ("company_token") `);
        await queryRunner.query(`CREATE TYPE "public"."channel_direction" AS ENUM('active', 'receptive', 'both')`);
        await queryRunner.query(`CREATE TABLE "channel_links" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "reference_id" character varying NOT NULL, "direction" "public"."channel_direction" NOT NULL DEFAULT 'both', "channel_config_id" uuid NOT NULL, CONSTRAINT "pk_channel_links_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_channel_links_reference_id" ON "channel_links" ("reference_id") `);
        await queryRunner.query(`ALTER TABLE "rcs"."pontal_tech_rcs_accounts" ADD CONSTRAINT "fk_pontal_tech_rcs_account_rcs_accounts_id" FOREIGN KEY ("rcs_account_id") REFERENCES "rcs"."rcs_accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "rcs"."chats" ADD CONSTRAINT "fk_chats_rcs_account_id" FOREIGN KEY ("rcs_account_id") REFERENCES "rcs"."rcs_accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "rcs"."messages" ADD CONSTRAINT "fk_messages_chat_id" FOREIGN KEY ("chat_id") REFERENCES "rcs"."chats"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "channel_links" ADD CONSTRAINT "fk_channel_links_channel_config_id" FOREIGN KEY ("channel_config_id") REFERENCES "channel_configs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "channel_links" DROP CONSTRAINT "fk_channel_links_channel_config_id"`);
        await queryRunner.query(`ALTER TABLE "rcs"."messages" DROP CONSTRAINT "fk_messages_chat_id"`);
        await queryRunner.query(`ALTER TABLE "rcs"."chats" DROP CONSTRAINT "fk_chats_rcs_account_id"`);
        await queryRunner.query(`ALTER TABLE "rcs"."pontal_tech_rcs_accounts" DROP CONSTRAINT "fk_pontal_tech_rcs_account_rcs_accounts_id"`);
        await queryRunner.query(`DROP INDEX "public"."idx_channel_links_reference_id"`);
        await queryRunner.query(`DROP TABLE "channel_links"`);
        await queryRunner.query(`DROP TYPE "public"."channel_direction"`);
        await queryRunner.query(`DROP INDEX "public"."idx_channel_configs_company_token"`);
        await queryRunner.query(`DROP TABLE "channel_configs"`);
        await queryRunner.query(`DROP TYPE "public"."channel_config_status"`);
        await queryRunner.query(`DROP TYPE "public"."broker_type"`);
        await queryRunner.query(`DROP TYPE "public"."channel_type"`);
        await queryRunner.query(`DROP INDEX "rcs"."idx_messages_chat_id"`);
        await queryRunner.query(`DROP TABLE "rcs"."messages"`);
        await queryRunner.query(`DROP TYPE "rcs"."message_status"`);
        await queryRunner.query(`DROP TYPE "rcs"."message_direction"`);
        await queryRunner.query(`DROP INDEX "rcs"."idx_chats_rcs_broker_chat_id"`);
        await queryRunner.query(`DROP INDEX "rcs"."idx_chats_reference_chat_id"`);
        await queryRunner.query(`DROP TABLE "rcs"."chats"`);
        await queryRunner.query(`DROP INDEX "rcs"."idx_rcs_account_reference_id"`);
        await queryRunner.query(`DROP TABLE "rcs"."rcs_accounts"`);
        await queryRunner.query(`DROP INDEX "rcs"."idx_pontal_tech_rcs_account_reference_id"`);
        await queryRunner.query(`DROP TABLE "rcs"."pontal_tech_rcs_accounts"`);
    }

}
