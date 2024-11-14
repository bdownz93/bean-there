-- Add website column to roasters table
ALTER TABLE public.roasters
ADD COLUMN IF NOT EXISTS website TEXT;