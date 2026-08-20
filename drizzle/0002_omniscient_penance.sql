ALTER TABLE "room" ADD COLUMN "teachers" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "room" ADD COLUMN "students" jsonb DEFAULT '{}'::jsonb NOT NULL;