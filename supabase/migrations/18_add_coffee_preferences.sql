-- Add coffee preferences column to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS coffee_preferences JSONB DEFAULT '{
  "roastLevel": 50,
  "acidity": 50,
  "sweetness": 50,
  "body": 50
}'::jsonb;

-- Add brewing methods column to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS brewing_methods TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Create storage bucket for avatars if it doesn't exist
INSERT INTO storage.buckets (id, name)
VALUES ('avatars', 'avatars')
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for avatars bucket
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid() = owner
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' AND
  auth.uid() = owner
);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' AND
  auth.uid() = owner
);

-- Update user stats to include coffee-related achievements
ALTER TABLE public.user_stats
ADD COLUMN IF NOT EXISTS brewing_methods_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS favorite_roast_level TEXT,
ADD COLUMN IF NOT EXISTS coffee_expertise_score INTEGER DEFAULT 0;