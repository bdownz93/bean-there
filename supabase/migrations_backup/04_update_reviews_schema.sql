-- Add new columns to reviews table
ALTER TABLE public.reviews
ADD COLUMN IF NOT EXISTS grind_size TEXT,
ADD COLUMN IF NOT EXISTS water_temp TEXT,
ADD COLUMN IF NOT EXISTS brew_time TEXT,
ADD COLUMN IF NOT EXISTS photo TEXT;