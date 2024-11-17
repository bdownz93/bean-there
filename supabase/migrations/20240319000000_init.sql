-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create tables
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS user_stats (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    beans_tried INTEGER DEFAULT 0,
    roasters_visited INTEGER DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    unique_origins INTEGER DEFAULT 0,
    roasters_created INTEGER DEFAULT 0,
    experience_points INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS roasters (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    location TEXT,
    website TEXT,
    logo_url TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS beans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    roaster_id UUID REFERENCES roasters(id) ON DELETE CASCADE NOT NULL,
    description TEXT,
    origin TEXT,
    process TEXT,
    roast_level TEXT,
    tasting_notes TEXT[],
    flavor_profile JSONB,
    price DECIMAL(10,2),
    weight INTEGER,
    currency TEXT DEFAULT 'USD',
    altitude TEXT,
    variety TEXT,
    harvest TEXT,
    is_featured BOOLEAN DEFAULT false,
    image_url TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    bean_id UUID REFERENCES beans(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    content TEXT,
    brew_method TEXT,
    flavor_notes TEXT[],
    photo_url TEXT,
    aroma INTEGER CHECK (aroma >= 1 AND aroma <= 5),
    body INTEGER CHECK (body >= 1 AND body <= 5),
    acidity INTEGER CHECK (acidity >= 1 AND acidity <= 5),
    sweetness INTEGER CHECK (sweetness >= 1 AND sweetness <= 5),
    aftertaste INTEGER CHECK (aftertaste >= 1 AND aftertaste <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, bean_id)
);

-- Create views
CREATE OR REPLACE VIEW featured_beans AS
SELECT 
    b.*,
    r.name AS roaster_name,
    r.slug AS roaster_slug,
    COALESCE(AVG(rv.rating)::NUMERIC(10,2), 0) as average_rating,
    COUNT(rv.id) as review_count
FROM beans b
LEFT JOIN roasters r ON b.roaster_id = r.id
LEFT JOIN reviews rv ON b.id = rv.bean_id
WHERE b.is_featured = true
GROUP BY b.id, r.id;

CREATE MATERIALIZED VIEW bean_stats AS
SELECT 
    b.id,
    COALESCE(AVG(rv.rating)::NUMERIC(10,2), 0) as average_rating,
    COUNT(rv.id) as review_count
FROM beans b
LEFT JOIN reviews rv ON b.id = rv.bean_id
GROUP BY b.id;

CREATE INDEX bean_stats_id_idx ON bean_stats(id);

-- Refresh function for bean_stats
CREATE OR REPLACE FUNCTION refresh_bean_stats()
RETURNS trigger AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY bean_stats;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to refresh bean_stats
CREATE TRIGGER refresh_bean_stats_on_review
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH STATEMENT
    EXECUTE FUNCTION refresh_bean_stats();

-- Create RLS policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE roasters ENABLE ROW LEVEL SECURITY;
ALTER TABLE beans ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users are viewable by everyone" ON users
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- User stats policies
CREATE POLICY "User stats are viewable by everyone" ON user_stats
    FOR SELECT USING (true);

CREATE POLICY "Users can update own stats" ON user_stats
    FOR UPDATE USING (auth.uid() = user_id);

-- Roasters policies
CREATE POLICY "Roasters are viewable by everyone" ON roasters
    FOR SELECT USING (true);

CREATE POLICY "Users can create roasters" ON roasters
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own roasters" ON roasters
    FOR UPDATE USING (auth.uid() = created_by);

-- Beans policies
CREATE POLICY "Beans are viewable by everyone" ON beans
    FOR SELECT USING (true);

CREATE POLICY "Users can create beans" ON beans
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own beans" ON beans
    FOR UPDATE USING (auth.uid() = created_by);

-- Reviews policies
CREATE POLICY "Reviews are viewable by everyone" ON reviews
    FOR SELECT USING (true);

CREATE POLICY "Users can create reviews" ON reviews
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own reviews" ON reviews
    FOR UPDATE USING (auth.uid() = user_id);

-- Functions
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, username, name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    'https://api.dicebear.com/7.x/avataaars/svg?seed=' || NEW.id
  );
  
  INSERT INTO public.user_stats (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();
