CREATE TABLE "quiz" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"last_run" timestamp,
	"tags" text[],
	"questions" jsonb NOT NULL
);
