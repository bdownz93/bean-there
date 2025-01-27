-- Create roast type enum if it doesn't exist
DO $$ BEGIN
  CREATE TYPE public.roast_type AS ENUM (
    'Light',
    'Medium Light',
    'Medium',
    'Medium Dark',
    'Dark',
    'Other'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create roasters table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.roasters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  location TEXT,
  website_url TEXT,
  description TEXT,
  logo_url TEXT,
  hero_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create beans table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.beans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  roaster_id UUID REFERENCES public.roasters(id) ON DELETE CASCADE NOT NULL,
  roast_level TEXT,
  origin TEXT,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create enum for brewing methods if it doesn't exist
DO $$ BEGIN
  CREATE TYPE public.brewing_method AS ENUM (
    'Pour Over',
    'French Press',
    'Espresso',
    'Drip',
    'AeroPress',
    'Cold Brew',
    'Moka Pot',
    'Chemex',
    'Other'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create ratings table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.bean_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  bean_id UUID REFERENCES public.beans(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  brewing_method brewing_method NOT NULL,
  review_text TEXT,
  aroma_notes TEXT[],
  flavor_notes TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, bean_id)
);

-- Create function to update updated_at if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at if they don't exist
DROP TRIGGER IF EXISTS update_bean_ratings_updated_at ON public.bean_ratings;
CREATE TRIGGER update_bean_ratings_updated_at
  BEFORE UPDATE ON public.bean_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_beans_updated_at ON public.beans;
CREATE TRIGGER update_beans_updated_at
  BEFORE UPDATE ON public.beans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_roasters_updated_at ON public.roasters;
CREATE TRIGGER update_roasters_updated_at
  BEFORE UPDATE ON public.roasters
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Drop and recreate view for bean rating statistics
DROP VIEW IF EXISTS public.bean_rating_stats;
CREATE VIEW public.bean_rating_stats AS
WITH unnested_notes AS (
  SELECT 
    bean_id,
    UNNEST(aroma_notes) as aroma_note,
    UNNEST(flavor_notes) as flavor_note
  FROM public.bean_ratings
  WHERE aroma_notes IS NOT NULL OR flavor_notes IS NOT NULL
)
SELECT 
  r.bean_id,
  COUNT(*) as total_ratings,
  ROUND(AVG(r.rating)::numeric, 2) as average_rating,
  COUNT(DISTINCT r.user_id) as unique_raters,
  array_agg(DISTINCT r.brewing_method) as brewing_methods,
  array_agg(DISTINCT n.aroma_note) FILTER (WHERE n.aroma_note IS NOT NULL) as all_aroma_notes,
  array_agg(DISTINCT n.flavor_note) FILTER (WHERE n.flavor_note IS NOT NULL) as all_flavor_notes
FROM public.bean_ratings r
LEFT JOIN unnested_notes n ON r.bean_id = n.bean_id
GROUP BY r.bean_id;

-- Enable RLS
ALTER TABLE public.bean_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roasters ENABLE ROW LEVEL SECURITY;

-- Create policies for bean_ratings
DROP POLICY IF EXISTS "Users can view all ratings" ON public.bean_ratings;
CREATE POLICY "Users can view all ratings"
  ON public.bean_ratings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can create their own ratings" ON public.bean_ratings;
CREATE POLICY "Users can create their own ratings"
  ON public.bean_ratings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own ratings" ON public.bean_ratings;
CREATE POLICY "Users can update their own ratings"
  ON public.bean_ratings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own ratings" ON public.bean_ratings;
CREATE POLICY "Users can delete their own ratings"
  ON public.bean_ratings FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for beans
DROP POLICY IF EXISTS "Users can view all beans" ON public.beans;
CREATE POLICY "Users can view all beans"
  ON public.beans FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can create beans" ON public.beans;
CREATE POLICY "Users can create beans"
  ON public.beans FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update beans" ON public.beans;
CREATE POLICY "Users can update beans"
  ON public.beans FOR UPDATE
  USING (true);

-- Create policies for roasters
DROP POLICY IF EXISTS "Users can view all roasters" ON public.roasters;
CREATE POLICY "Users can view all roasters"
  ON public.roasters FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can create roasters" ON public.roasters;
CREATE POLICY "Users can create roasters"
  ON public.roasters FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update roasters" ON public.roasters;
CREATE POLICY "Users can update roasters"
  ON public.roasters FOR UPDATE
  USING (true);

-- Insert test roasters if they don't exist
INSERT INTO public.roasters (id, name, slug, location, website_url, description, logo_url, hero_image_url)
VALUES
  ('22222222-2222-2222-2222-222222222222', 'Artisan Coffee Co.', 'artisan-coffee-co', 'Portland, OR', 'https://example.com/artisan', 'Craft coffee roasters focusing on single-origin beans', 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=400&h=400&fit=crop', 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=1200&h=600&fit=crop'),
  ('55555555-5555-5555-5555-555555555555', 'Mountain Peak Coffee', 'mountain-peak-coffee', 'Seattle, WA', 'https://example.com/mountain', 'Specializing in dark roasts and bold flavors', 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&h=400&fit=crop', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&h=600&fit=crop')
ON CONFLICT (id) DO NOTHING;

-- Insert test beans if they don't exist
INSERT INTO public.beans (id, name, slug, roaster_id, roast_level, origin, description, image_url)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Ethiopian Yirgacheffe', 'ethiopian-yirgacheffe', '22222222-2222-2222-2222-222222222222', 'Light', 'Ethiopia', 'A bright and complex coffee with floral and citrus notes', 'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?w=800&h=800&fit=crop'),
  ('33333333-3333-3333-3333-333333333333', 'Colombian Supremo', 'colombian-supremo', '22222222-2222-2222-2222-222222222222', 'Medium', 'Colombia', 'Well-balanced with caramel sweetness and nutty undertones', 'https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=800&h=800&fit=crop'),
  ('44444444-4444-4444-4444-444444444444', 'Sumatra Mandheling', 'sumatra-mandheling', '55555555-5555-5555-5555-555555555555', 'Dark', 'Indonesia', 'Full-bodied with earthy and spicy notes', 'https://images.unsplash.com/photo-1610889556528-9a770e32642f?w=800&h=800&fit=crop')
ON CONFLICT (id) DO NOTHING;

-- Insert test users if they don't exist
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'alice@test.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW()),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'bob@test.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW()),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'charlie@test.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert test ratings if they don't exist
INSERT INTO public.bean_ratings (user_id, bean_id, rating, brewing_method, review_text, aroma_notes, flavor_notes)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 5, 'Pour Over', 'Absolutely stunning! The floral notes really shine through with the pour-over method.', ARRAY['Jasmine', 'Citrus'], ARRAY['Lemon', 'Bergamot', 'Honey']),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 4, 'French Press', 'Great body and aroma, though slightly less bright than I expected.', ARRAY['Floral', 'Berry'], ARRAY['Blueberry', 'Dark Chocolate']),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333', 5, 'Espresso', 'Makes an incredible espresso! Sweet and nutty.', ARRAY['Caramel', 'Nutty'], ARRAY['Hazelnut', 'Brown Sugar']),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '44444444-4444-4444-4444-444444444444', 4, 'French Press', 'Rich and complex. Perfect for cold mornings.', ARRAY['Earthy', 'Spicy'], ARRAY['Cedar', 'Black Pepper', 'Dark Chocolate'])
ON CONFLICT ON CONSTRAINT bean_ratings_user_id_bean_id_key DO NOTHING;
