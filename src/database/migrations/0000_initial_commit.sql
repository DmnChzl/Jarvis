CREATE TABLE "agents" (
	"key" varchar PRIMARY KEY NOT NULL,
	"short_name" varchar(64) NOT NULL,
	"full_name" varchar(128),
	"img_src" varchar NOT NULL,
	"description" varchar(128) NOT NULL,
	"long_description" varchar(256),
	"persona" text NOT NULL,
	"theme_color" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"agent_key" varchar,
	"session_id" varchar(36) NOT NULL,
	"role" varchar NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_agent_key_agents_key_fk" FOREIGN KEY ("agent_key") REFERENCES "public"."agents"("key") ON DELETE no action ON UPDATE no action;