DROP TABLE "tt_messages" CASCADE;--> statement-breakpoint
ALTER TABLE "tt_conversations" ADD COLUMN "messages" jsonb DEFAULT '[]'::jsonb NOT NULL;