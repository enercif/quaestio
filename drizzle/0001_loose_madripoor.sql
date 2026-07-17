CREATE TABLE "room" (
	"id" text PRIMARY KEY NOT NULL,
	"limit" integer,
	"quiz_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "quiz" ALTER COLUMN "tags" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "room" ADD CONSTRAINT "room_quiz_id_quiz_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quiz"("id") ON DELETE no action ON UPDATE no action;