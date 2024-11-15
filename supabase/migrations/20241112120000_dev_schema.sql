

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.users (id, name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || NEW.id)
  );
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."refresh_featured_beans"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY featured_beans;
    RETURN NULL;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error refreshing featured_beans view: %', SQLERRM;
        RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."refresh_featured_beans"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_timestamp"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_timestamp"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."beans" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "created_by" "uuid",
    "roaster_id" "uuid",
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "origin" "text",
    "process" "text",
    "roast_level" "text",
    "description" "text",
    "price" numeric(10,2),
    "rating" numeric(3,2) DEFAULT 0,
    "image_url" "text",
    "tasting_notes" "text"[] DEFAULT ARRAY[]::"text"[],
    "flavor_profile" "jsonb",
    "altitude" "text",
    "variety" "text",
    "harvest" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "beans_price_check" CHECK (("price" >= (0)::numeric)),
    CONSTRAINT "beans_rating_check" CHECK ((("rating" >= (0)::numeric) AND ("rating" <= (5)::numeric))),
    CONSTRAINT "valid_slug" CHECK ((("length"("slug") >= 3) AND ("length"("slug") <= 100)))
);


ALTER TABLE "public"."beans" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."review_comments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "review_id" "uuid",
    "content" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."review_comments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."review_likes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "review_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."review_likes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reviews" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "bean_id" "uuid",
    "rating" integer,
    "content" "text",
    "brew_method" "text",
    "photo_url" "text",
    "aroma" integer,
    "body" integer,
    "acidity" integer,
    "sweetness" integer,
    "aftertaste" integer,
    "flavor_notes" "text"[] DEFAULT ARRAY[]::"text"[],
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "grind_size" "text",
    CONSTRAINT "reviews_acidity_check" CHECK ((("acidity" >= 0) AND ("acidity" <= 100))),
    CONSTRAINT "reviews_aftertaste_check" CHECK ((("aftertaste" >= 0) AND ("aftertaste" <= 100))),
    CONSTRAINT "reviews_aroma_check" CHECK ((("aroma" >= 0) AND ("aroma" <= 100))),
    CONSTRAINT "reviews_body_check" CHECK ((("body" >= 0) AND ("body" <= 100))),
    CONSTRAINT "reviews_rating_check" CHECK ((("rating" >= 0) AND ("rating" <= 5))),
    CONSTRAINT "reviews_sweetness_check" CHECK ((("sweetness" >= 0) AND ("sweetness" <= 100)))
);


ALTER TABLE "public"."reviews" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."roasters" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "created_by" "uuid",
    "slug" "text" NOT NULL,
    "name" "text" NOT NULL,
    "location" "text",
    "description" "text",
    "logo_url" "text",
    "website_url" "text",
    "rating" numeric(3,2) DEFAULT 0,
    "coordinates" "jsonb" DEFAULT '{"lat": 0, "lng": 0}'::"jsonb",
    "specialties" "text"[] DEFAULT ARRAY[]::"text"[],
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "roasters_rating_check" CHECK ((("rating" >= (0)::numeric) AND ("rating" <= (5)::numeric))),
    CONSTRAINT "valid_slug" CHECK ((("length"("slug") >= 3) AND ("length"("slug") <= 100)))
);


ALTER TABLE "public"."roasters" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_stats" (
    "user_id" "uuid" NOT NULL,
    "beans_tried" integer DEFAULT 0,
    "roasters_visited" integer DEFAULT 0,
    "total_reviews" integer DEFAULT 0,
    "unique_origins" integer DEFAULT 0,
    "roasters_created" integer DEFAULT 0,
    "experience_points" integer DEFAULT 0,
    "level" integer DEFAULT 1,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "user_stats_beans_tried_check" CHECK (("beans_tried" >= 0)),
    CONSTRAINT "user_stats_experience_points_check" CHECK (("experience_points" >= 0)),
    CONSTRAINT "user_stats_level_check" CHECK (("level" >= 1)),
    CONSTRAINT "user_stats_roasters_created_check" CHECK (("roasters_created" >= 0)),
    CONSTRAINT "user_stats_roasters_visited_check" CHECK (("roasters_visited" >= 0)),
    CONSTRAINT "user_stats_total_reviews_check" CHECK (("total_reviews" >= 0)),
    CONSTRAINT "user_stats_unique_origins_check" CHECK (("unique_origins" >= 0))
);


ALTER TABLE "public"."user_stats" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" NOT NULL,
    "name" "text",
    "username" "text",
    "avatar_url" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."users" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."visited_roasters" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "roaster_id" "uuid",
    "visited_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."visited_roasters" OWNER TO "postgres";


ALTER TABLE ONLY "public"."beans"
    ADD CONSTRAINT "beans_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."roasters"
    ADD CONSTRAINT "roasters_pkey" PRIMARY KEY ("id");



CREATE MATERIALIZED VIEW "public"."featured_beans" AS
 SELECT "b"."id",
    "b"."created_by",
    "b"."roaster_id",
    "b"."name",
    "b"."slug",
    "b"."origin",
    "b"."process",
    "b"."roast_level",
    "b"."description",
    "b"."price",
    "b"."rating",
    "b"."image_url",
    "b"."tasting_notes",
    "b"."flavor_profile",
    "b"."altitude",
    "b"."variety",
    "b"."harvest",
    "b"."created_at",
    "b"."updated_at",
    "r"."name" AS "roaster_name",
    "r"."slug" AS "roaster_slug",
    "count"("rv"."id") AS "review_count",
    COALESCE("avg"("rv"."rating"), (0)::numeric) AS "average_rating"
   FROM (("public"."beans" "b"
     LEFT JOIN "public"."roasters" "r" ON (("b"."roaster_id" = "r"."id")))
     LEFT JOIN "public"."reviews" "rv" ON (("b"."id" = "rv"."bean_id")))
  GROUP BY "b"."id", "r"."id"
  ORDER BY COALESCE("avg"("rv"."rating"), (0)::numeric) DESC, ("count"("rv"."id")) DESC
 LIMIT 10
  WITH NO DATA;


ALTER TABLE "public"."featured_beans" OWNER TO "postgres";


ALTER TABLE ONLY "public"."beans"
    ADD CONSTRAINT "beans_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."review_comments"
    ADD CONSTRAINT "review_comments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."review_likes"
    ADD CONSTRAINT "review_likes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."review_likes"
    ADD CONSTRAINT "review_likes_user_id_review_id_key" UNIQUE ("user_id", "review_id");



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."roasters"
    ADD CONSTRAINT "roasters_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "unique_user_bean" UNIQUE ("user_id", "bean_id");



ALTER TABLE ONLY "public"."user_stats"
    ADD CONSTRAINT "user_stats_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_username_key" UNIQUE ("username");



ALTER TABLE ONLY "public"."visited_roasters"
    ADD CONSTRAINT "visited_roasters_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."visited_roasters"
    ADD CONSTRAINT "visited_roasters_user_id_roaster_id_key" UNIQUE ("user_id", "roaster_id");



CREATE UNIQUE INDEX "featured_beans_id_idx" ON "public"."featured_beans" USING "btree" ("id");



CREATE INDEX "idx_beans_rating" ON "public"."beans" USING "btree" ("rating");



CREATE INDEX "idx_beans_roaster_id" ON "public"."beans" USING "btree" ("roaster_id");



CREATE INDEX "idx_beans_slug" ON "public"."beans" USING "btree" ("slug");



CREATE INDEX "idx_reviews_bean_id" ON "public"."reviews" USING "btree" ("bean_id");



CREATE INDEX "idx_reviews_rating" ON "public"."reviews" USING "btree" ("rating");



CREATE INDEX "idx_reviews_user_id" ON "public"."reviews" USING "btree" ("user_id");



CREATE INDEX "idx_roasters_rating" ON "public"."roasters" USING "btree" ("rating");



CREATE INDEX "idx_roasters_slug" ON "public"."roasters" USING "btree" ("slug");



CREATE INDEX "review_comments_review_id_idx" ON "public"."review_comments" USING "btree" ("review_id");



CREATE INDEX "review_comments_user_id_idx" ON "public"."review_comments" USING "btree" ("user_id");



CREATE INDEX "review_likes_review_id_idx" ON "public"."review_likes" USING "btree" ("review_id");



CREATE INDEX "review_likes_user_id_idx" ON "public"."review_likes" USING "btree" ("user_id");



CREATE OR REPLACE TRIGGER "refresh_featured_beans_on_bean" AFTER INSERT OR DELETE OR UPDATE ON "public"."beans" FOR EACH STATEMENT EXECUTE FUNCTION "public"."refresh_featured_beans"();



CREATE OR REPLACE TRIGGER "refresh_featured_beans_on_review" AFTER INSERT OR DELETE OR UPDATE ON "public"."reviews" FOR EACH STATEMENT EXECUTE FUNCTION "public"."refresh_featured_beans"();



CREATE OR REPLACE TRIGGER "update_beans_timestamp" BEFORE UPDATE ON "public"."beans" FOR EACH ROW EXECUTE FUNCTION "public"."update_timestamp"();



CREATE OR REPLACE TRIGGER "update_reviews_timestamp" BEFORE UPDATE ON "public"."reviews" FOR EACH ROW EXECUTE FUNCTION "public"."update_timestamp"();



CREATE OR REPLACE TRIGGER "update_roasters_timestamp" BEFORE UPDATE ON "public"."roasters" FOR EACH ROW EXECUTE FUNCTION "public"."update_timestamp"();



CREATE OR REPLACE TRIGGER "update_user_stats_timestamp" BEFORE UPDATE ON "public"."user_stats" FOR EACH ROW EXECUTE FUNCTION "public"."update_timestamp"();



ALTER TABLE ONLY "public"."beans"
    ADD CONSTRAINT "beans_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."beans"
    ADD CONSTRAINT "beans_roaster_id_fkey" FOREIGN KEY ("roaster_id") REFERENCES "public"."roasters"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."review_comments"
    ADD CONSTRAINT "review_comments_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "public"."reviews"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."review_comments"
    ADD CONSTRAINT "review_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."review_likes"
    ADD CONSTRAINT "review_likes_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "public"."reviews"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."review_likes"
    ADD CONSTRAINT "review_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_bean_id_fkey" FOREIGN KEY ("bean_id") REFERENCES "public"."beans"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."roasters"
    ADD CONSTRAINT "roasters_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."user_stats"
    ADD CONSTRAINT "user_stats_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."visited_roasters"
    ADD CONSTRAINT "visited_roasters_roaster_id_fkey" FOREIGN KEY ("roaster_id") REFERENCES "public"."roasters"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."visited_roasters"
    ADD CONSTRAINT "visited_roasters_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Authenticated users can create beans" ON "public"."beans" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Authenticated users can create roasters" ON "public"."roasters" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Enable delete for own comments" ON "public"."review_comments" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Enable delete for own likes" ON "public"."review_likes" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Enable delete for own reviews" ON "public"."reviews" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Enable insert for authenticated users" ON "public"."review_comments" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Enable insert for authenticated users" ON "public"."review_likes" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Enable insert for authenticated users" ON "public"."reviews" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Enable read access for all" ON "public"."reviews" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."beans" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."review_comments" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."review_likes" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."roasters" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."users" FOR SELECT USING (true);



CREATE POLICY "Enable update for own comments" ON "public"."review_comments" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Enable update for own profile" ON "public"."users" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "id"));



CREATE POLICY "Enable update for own reviews" ON "public"."reviews" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Enable update for user stats based on user_id" ON "public"."user_stats" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can mark roasters as visited" ON "public"."visited_roasters" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can remove visited roasters" ON "public"."visited_roasters" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update beans they created" ON "public"."beans" FOR UPDATE USING (("auth"."uid"() = "created_by"));



CREATE POLICY "Users can update roasters they created" ON "public"."roasters" FOR UPDATE USING (("auth"."uid"() = "created_by"));



CREATE POLICY "Users can view their own stats" ON "public"."user_stats" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view visited roasters" ON "public"."visited_roasters" FOR SELECT USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."beans" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."review_comments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."review_likes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."reviews" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."roasters" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_stats" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."visited_roasters" ENABLE ROW LEVEL SECURITY;


REVOKE USAGE ON SCHEMA "public" FROM PUBLIC;
GRANT ALL ON SCHEMA "public" TO PUBLIC;
GRANT USAGE ON SCHEMA "public" TO "authenticated";



GRANT SELECT ON TABLE "public"."beans" TO "anon";
GRANT SELECT ON TABLE "public"."beans" TO "authenticated";



GRANT ALL ON TABLE "public"."review_comments" TO "authenticated";



GRANT ALL ON TABLE "public"."review_likes" TO "authenticated";



GRANT SELECT ON TABLE "public"."reviews" TO "anon";
GRANT ALL ON TABLE "public"."reviews" TO "authenticated";



GRANT SELECT ON TABLE "public"."roasters" TO "anon";
GRANT SELECT ON TABLE "public"."roasters" TO "authenticated";



GRANT ALL ON TABLE "public"."user_stats" TO "authenticated";



GRANT ALL ON TABLE "public"."users" TO "authenticated";



GRANT SELECT ON TABLE "public"."featured_beans" TO "anon";
GRANT SELECT ON TABLE "public"."featured_beans" TO "authenticated";



RESET ALL;
