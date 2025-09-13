CREATE TYPE "public"."gender" AS ENUM('male', 'female', 'nonbinary', 'prefer_not_to_say');--> statement-breakpoint
CREATE TYPE "public"."message_role" AS ENUM('user', 'local', 'system');--> statement-breakpoint
CREATE TYPE "public"."message_source" AS ENUM('speech', 'tap', 'llm', 'tts');--> statement-breakpoint
CREATE TABLE "tt_conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"target_lang" varchar(16) NOT NULL,
	"scenario_snapshot" jsonb,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ended_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tt_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"role" "message_role" NOT NULL,
	"lang" varchar(16) NOT NULL,
	"text" text NOT NULL,
	"ts" timestamp with time zone DEFAULT now() NOT NULL,
	"source" "message_source",
	"audio_key" text,
	"meta" jsonb
);
--> statement-breakpoint
CREATE TABLE "tt_phrases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scenario_id" uuid NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"group" text,
	"label" text NOT NULL,
	"local_dialogue" text NOT NULL,
	"target_dialogue" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tt_scenarios" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"context" text,
	"target_lang" varchar(16) NOT NULL,
	"tags" text[] DEFAULT '{}'::text[],
	"pinned" boolean DEFAULT false NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "tt_account" (
	"userId" uuid NOT NULL,
	"type" varchar(255) NOT NULL,
	"provider" varchar(255) NOT NULL,
	"providerAccountId" varchar(255) NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" varchar(255),
	"scope" varchar(255),
	"id_token" text,
	"session_state" varchar(255),
	CONSTRAINT "tt_account_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE "tt_session" (
	"sessionToken" varchar(255) PRIMARY KEY NOT NULL,
	"userId" uuid NOT NULL,
	"expires" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tt_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255),
	"email" varchar(255),
	"email_verified" timestamp with time zone,
	"image" varchar(1024),
	"display_name" text,
	"real_name" text,
	"gender" "gender",
	"preferred_language" varchar(16),
	"travel_preferences" text[] DEFAULT '{}'::text[],
	"food_allergies" text,
	"religion" text,
	"personal_notes" text,
	"settings" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "tt_verification_token" (
	"identifier" varchar(255) NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires" timestamp with time zone NOT NULL,
	CONSTRAINT "tt_verification_token_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
ALTER TABLE "tt_conversations" ADD CONSTRAINT "tt_conversations_user_id_tt_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."tt_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tt_messages" ADD CONSTRAINT "tt_messages_conversation_id_tt_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."tt_conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tt_phrases" ADD CONSTRAINT "tt_phrases_scenario_id_tt_scenarios_id_fk" FOREIGN KEY ("scenario_id") REFERENCES "public"."tt_scenarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tt_scenarios" ADD CONSTRAINT "tt_scenarios_user_id_tt_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."tt_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "conversations_user_started_idx" ON "tt_conversations" USING btree ("user_id","started_at");--> statement-breakpoint
CREATE INDEX "conversations_target_lang_idx" ON "tt_conversations" USING btree ("target_lang");--> statement-breakpoint
CREATE INDEX "messages_conversation_ts_idx" ON "tt_messages" USING btree ("conversation_id","ts");--> statement-breakpoint
CREATE INDEX "phrases_scenario_order_idx" ON "tt_phrases" USING btree ("scenario_id","order");--> statement-breakpoint
CREATE INDEX "scenarios_user_updated_idx" ON "tt_scenarios" USING btree ("user_id","updated_at");--> statement-breakpoint
CREATE INDEX "scenarios_target_lang_idx" ON "tt_scenarios" USING btree ("target_lang");--> statement-breakpoint
CREATE INDEX "scenarios_pinned_idx" ON "tt_scenarios" USING btree ("pinned");--> statement-breakpoint
CREATE INDEX "account_user_id_idx" ON "tt_account" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "t_user_id_idx" ON "tt_session" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "tt_users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_display_name_idx" ON "tt_users" USING btree ("display_name");