CREATE TABLE "answer" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"room_id" text NOT NULL,
	"quiz_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"student_id" text NOT NULL,
	"student_name" text NOT NULL,
	"selected" text[] NOT NULL,
	"answered_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "answer_room_id_question_id_student_id_unique" UNIQUE("room_id","question_id","student_id")
);
--> statement-breakpoint
ALTER TABLE "room" ADD COLUMN "question_ends_at" bigint;--> statement-breakpoint
ALTER TABLE "room" ADD COLUMN "paused_remaining" integer;--> statement-breakpoint
ALTER TABLE "answer" ADD CONSTRAINT "answer_quiz_id_quiz_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quiz"("id") ON DELETE no action ON UPDATE no action;