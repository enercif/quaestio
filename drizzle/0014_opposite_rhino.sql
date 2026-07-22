CREATE TABLE "smtp_settings" (
	"id" text PRIMARY KEY DEFAULT 'default' NOT NULL,
	"host" text NOT NULL,
	"port" integer NOT NULL,
	"user" text,
	"pass" text,
	"from" text,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
