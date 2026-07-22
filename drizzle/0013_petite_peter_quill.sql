ALTER TABLE "answer" ALTER COLUMN "answered_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "answer" ALTER COLUMN "answered_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "quiz" ALTER COLUMN "last_run" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "quiz" ALTER COLUMN "deleted_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "room" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "room" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "room" ALTER COLUMN "deleted_at" SET DATA TYPE timestamp with time zone;