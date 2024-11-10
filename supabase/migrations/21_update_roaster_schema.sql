-- Add phone column to roasters table
ALTER TABLE public.roasters
ADD COLUMN IF NOT EXISTS phone TEXT;