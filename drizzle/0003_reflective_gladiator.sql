ALTER TABLE "tt_conversations" ADD COLUMN "scenario_id" uuid;--> statement-breakpoint
ALTER TABLE "tt_conversations" ADD COLUMN "scenario_title" text NOT NULL;--> statement-breakpoint
ALTER TABLE "tt_conversations" ADD COLUMN "scenario_context" text;--> statement-breakpoint
ALTER TABLE "tt_conversations" ADD CONSTRAINT "tt_conversations_scenario_id_tt_scenarios_id_fk" FOREIGN KEY ("scenario_id") REFERENCES "public"."tt_scenarios"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tt_conversations" DROP COLUMN "scenario_snapshot";