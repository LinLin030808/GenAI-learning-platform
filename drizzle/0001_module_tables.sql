CREATE TABLE "lesson_adaptations" (
	"lesson_id" text NOT NULL,
	"variant" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lesson_adaptations_lesson_id_variant_pk" PRIMARY KEY("lesson_id","variant")
);
--> statement-breakpoint
CREATE TABLE "leaderboard_class_settings" (
	"class_id" text PRIMARY KEY NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leaderboard_prefs" (
	"user_id" text PRIMARY KEY NOT NULL,
	"display_mode" text DEFAULT 'name' NOT NULL,
	"nickname" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "lesson_adaptations" ADD CONSTRAINT "lesson_adaptations_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leaderboard_class_settings" ADD CONSTRAINT "leaderboard_class_settings_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leaderboard_prefs" ADD CONSTRAINT "leaderboard_prefs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;