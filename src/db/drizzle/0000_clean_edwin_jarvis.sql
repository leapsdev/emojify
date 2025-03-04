CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"address" text,
	"username" text,
	"profile_image_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
