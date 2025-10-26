CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" varchar(36) NOT NULL,
	"role" varchar NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp NOT NULL
);
