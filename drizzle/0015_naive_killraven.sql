CREATE TYPE "public"."quiz_visibility" AS ENUM('private', 'public');--> statement-breakpoint
ALTER TABLE "quiz" ADD COLUMN "teacher_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "quiz" ADD COLUMN "visibility" "quiz_visibility" DEFAULT 'public' NOT NULL;--> statement-breakpoint
ALTER TABLE "quiz" ADD CONSTRAINT "quiz_teacher_id_user_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;