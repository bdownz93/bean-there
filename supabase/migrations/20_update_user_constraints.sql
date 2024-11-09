-- Remove NOT NULL constraints from optional fields
ALTER TABLE public.users
  ALTER COLUMN username DROP NOT NULL,
  ALTER COLUMN bio DROP NOT NULL,
  ALTER COLUMN favorite_coffee_styles DROP NOT NULL;

-- Add NOT NULL constraint only to name
ALTER TABLE public.users
  ALTER COLUMN name SET NOT NULL;