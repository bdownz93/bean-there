-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables if they don't exist
CREATE TABLE IF NOT EXISTS public.roasters (
  id uuid PRIMARY KEY,
  slug text UNIQUE,
  name text NOT NULL,
  location text,
  description text,
  logo_url text,
  rating decimal(3,2),
  coordinates jsonb,
  specialties text[],
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.beans (
  id uuid PRIMARY KEY,
  roaster_id uuid REFERENCES public.roasters ON DELETE CASCADE,
  name text NOT NULL,
  slug text UNIQUE,
  origin text,
  process text,
  roast_level text,
  description text,
  price decimal(10,2),
  rating decimal(3,2),
  image_url text,
  tasting_notes text[],
  flavor_profile jsonb,
  altitude text,
  variety text,
  harvest text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  bean_id uuid REFERENCES public.beans ON DELETE CASCADE NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  content text NOT NULL,
  brew_method text,
  flavor_notes text[],
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.roasters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Roasters are viewable by everyone" ON roasters;
DROP POLICY IF EXISTS "Beans are viewable by everyone" ON beans;
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON reviews;
DROP POLICY IF EXISTS "Authenticated users can insert reviews" ON reviews;
DROP POLICY IF EXISTS "Users can update their own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can delete their own reviews" ON reviews;

-- Create policies
CREATE POLICY "Roasters are viewable by everyone" 
  ON roasters FOR SELECT 
  USING (true);

CREATE POLICY "Beans are viewable by everyone" 
  ON beans FOR SELECT 
  USING (true);

CREATE POLICY "Reviews are viewable by everyone" 
  ON reviews FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can insert reviews" 
  ON reviews FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own reviews" 
  ON reviews FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" 
  ON reviews FOR DELETE 
  USING (auth.uid() = user_id);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language plpgsql;

DROP TRIGGER IF EXISTS handle_roasters_updated_at ON roasters;
CREATE TRIGGER handle_roasters_updated_at
  BEFORE UPDATE ON roasters
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS handle_beans_updated_at ON beans;
CREATE TRIGGER handle_beans_updated_at
  BEFORE UPDATE ON beans
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS handle_reviews_updated_at ON reviews;
CREATE TRIGGER handle_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();