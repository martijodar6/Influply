CREATE TABLE "applications" (
	"id" text PRIMARY KEY NOT NULL,
	"campaign_id" text NOT NULL,
	"creator_id" text NOT NULL,
	"message" text,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "campaigns" (
	"id" text PRIMARY KEY NOT NULL,
	"company_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"objective" text,
	"category" text NOT NULL,
	"location" text NOT NULL,
	"start_date" text,
	"application_deadline" text,
	"creator_types" text DEFAULT '[]' NOT NULL,
	"requirements" text DEFAULT '{}' NOT NULL,
	"compensation_types" text DEFAULT '[]' NOT NULL,
	"budget_approx" text,
	"content_requested" text DEFAULT '[]' NOT NULL,
	"cover_image_url" text,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "company_profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"logo_url" text,
	"cover_photo_url" text,
	"category" text NOT NULL,
	"city" text,
	"description" text,
	"website" text,
	"instagram" text,
	"tiktok" text,
	"photos" text DEFAULT '[]' NOT NULL,
	"videos" text DEFAULT '[]' NOT NULL,
	"onboarding_done" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "company_profiles_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "company_profiles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "creator_profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"display_name" text NOT NULL,
	"username" text NOT NULL,
	"avatar_url" text,
	"cover_photo_url" text,
	"city" text,
	"bio" text,
	"categories" text DEFAULT '[]' NOT NULL,
	"custom_niches" text DEFAULT '[]' NOT NULL,
	"languages" text DEFAULT '[]' NOT NULL,
	"brands_worked_with" text DEFAULT '[]' NOT NULL,
	"price_approx" text,
	"availability" text,
	"date_of_birth" text,
	"gender" text,
	"onboarding_done" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "creator_profiles_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "creator_profiles_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "favorites" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"target_type" text NOT NULL,
	"target_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"message" text NOT NULL,
	"read" boolean DEFAULT false NOT NULL,
	"related_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "password_reset_tokens" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "password_reset_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "portfolio_items" (
	"id" text PRIMARY KEY NOT NULL,
	"creator_id" text NOT NULL,
	"type" text NOT NULL,
	"url" text,
	"external_video_url" text,
	"caption" text,
	"brand" text,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "social_networks" (
	"id" text PRIMARY KEY NOT NULL,
	"creator_id" text NOT NULL,
	"platform" text NOT NULL,
	"handle" text NOT NULL,
	"followers" integer,
	"engagement_rate" real
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" text NOT NULL,
	"name" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_creator_id_creator_profiles_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."creator_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_company_id_company_profiles_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."company_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_profiles" ADD CONSTRAINT "company_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_profiles" ADD CONSTRAINT "creator_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portfolio_items" ADD CONSTRAINT "portfolio_items_creator_id_creator_profiles_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."creator_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_networks" ADD CONSTRAINT "social_networks_creator_id_creator_profiles_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."creator_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "application_campaign_creator_idx" ON "applications" USING btree ("campaign_id","creator_id");--> statement-breakpoint
CREATE INDEX "application_status_idx" ON "applications" USING btree ("status");--> statement-breakpoint
CREATE INDEX "campaign_category_idx" ON "campaigns" USING btree ("category");--> statement-breakpoint
CREATE INDEX "campaign_location_idx" ON "campaigns" USING btree ("location");--> statement-breakpoint
CREATE INDEX "campaign_status_idx" ON "campaigns" USING btree ("status");--> statement-breakpoint
CREATE INDEX "company_city_idx" ON "company_profiles" USING btree ("city");--> statement-breakpoint
CREATE INDEX "creator_city_idx" ON "creator_profiles" USING btree ("city");--> statement-breakpoint
CREATE UNIQUE INDEX "favorite_user_target_idx" ON "favorites" USING btree ("user_id","target_type","target_id");--> statement-breakpoint
CREATE INDEX "favorite_target_idx" ON "favorites" USING btree ("target_type","target_id");--> statement-breakpoint
CREATE INDEX "notification_user_read_idx" ON "notifications" USING btree ("user_id","read");--> statement-breakpoint
CREATE INDEX "reset_user_idx" ON "password_reset_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "portfolio_creator_idx" ON "portfolio_items" USING btree ("creator_id");--> statement-breakpoint
CREATE INDEX "social_creator_idx" ON "social_networks" USING btree ("creator_id");