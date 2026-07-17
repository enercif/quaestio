ALTER TABLE "room" ADD COLUMN "current_question" jsonb;--> statement-breakpoint
ALTER TABLE "room" ADD COLUMN "current_answers" text[];