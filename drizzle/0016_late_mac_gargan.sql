DROP INDEX "room_id_active_unique";--> statement-breakpoint
ALTER TABLE "answer" ALTER COLUMN "room_id" SET DATA TYPE uuid USING "room_id"::uuid;--> statement-breakpoint
ALTER TABLE "room" DROP CONSTRAINT "room_pkey";--> statement-breakpoint
ALTER TABLE "room" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "room" ALTER COLUMN "id" SET DATA TYPE uuid USING "id"::uuid;--> statement-breakpoint
ALTER TABLE "room" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "answer" ADD COLUMN "points_override" integer;--> statement-breakpoint
ALTER TABLE "room" ADD COLUMN "code" text NOT NULL;--> statement-breakpoint
ALTER TABLE "answer" ADD CONSTRAINT "answer_room_id_room_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."room"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "room_code_active_unique" ON "room" USING btree ("code") WHERE "room"."deleted_at" is null;--> statement-breakpoint
ALTER TABLE "room" DROP COLUMN "pk";
