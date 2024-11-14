-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view roasters" ON public.roasters;
DROP POLICY IF EXISTS "Authenticated users can create roasters" ON public.roasters;
DROP POLICY IF EXISTS "Users can update their own roasters" ON public.roasters;
DROP POLICY IF EXISTS "Users can delete their own roasters" ON public.roasters;

-- Enable RLS
ALTER TABLE public.roasters ENABLE ROW LEVEL SECURITY;

-- Create comprehensive policies
CREATE POLICY "Anyone can view roasters"
ON public.roasters FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create roasters"
ON public.roasters FOR INSERT
WITH CHECK (
    auth.role() = 'authenticated' AND
    (created_by IS NULL OR created_by = auth.uid())
);

CREATE POLICY "Users can update their own roasters"
ON public.roasters FOR UPDATE
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own roasters"
ON public.roasters FOR DELETE
USING (auth.uid() = created_by);

-- Update roaster handling function
CREATE OR REPLACE FUNCTION public.handle_new_roaster()
RETURNS TRIGGER AS $$
BEGIN
    -- Set created_by to current user if not provided
    IF NEW.created_by IS NULL THEN
        NEW.created_by = auth.uid();
    END IF;

    -- Generate slug if not provided
    IF NEW.slug IS NULL THEN
        NEW.slug = LOWER(REGEXP_REPLACE(NEW.name, '[^a-zA-Z0-9]+', '-', 'g'));
    END IF;

    -- Initialize rating if not provided
    IF NEW.rating IS NULL THEN
        NEW.rating = 0;
    END IF;

    -- Set timestamps
    NEW.created_at = COALESCE(NEW.created_at, now());
    NEW.updated_at = COALESCE(NEW.updated_at, now());

    -- Ensure coordinates is valid JSONB
    IF NEW.coordinates IS NULL THEN
        NEW.coordinates = '{"lat": 0, "lng": 0}'::jsonb;
    END IF;

    -- Ensure specialties is a valid array
    IF NEW.specialties IS NULL THEN
        NEW.specialties = ARRAY[]::text[];
    END IF;

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'Error in handle_new_roaster: %', SQLERRM;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_roaster_created ON public.roasters;
CREATE TRIGGER on_roaster_created
    BEFORE INSERT ON public.roasters
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_roaster();

-- Add necessary indexes
CREATE INDEX IF NOT EXISTS idx_roasters_created_by ON public.roasters(created_by);
CREATE INDEX IF NOT EXISTS idx_roasters_slug ON public.roasters(slug);

-- Ensure roasters table has all required columns
DO $$ 
BEGIN
    ALTER TABLE public.roasters ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);
    ALTER TABLE public.roasters ADD COLUMN IF NOT EXISTS slug text;
    ALTER TABLE public.roasters ADD COLUMN IF NOT EXISTS rating decimal(3,2) DEFAULT 0;
    ALTER TABLE public.roasters ADD COLUMN IF NOT EXISTS coordinates jsonb;
    ALTER TABLE public.roasters ADD COLUMN IF NOT EXISTS specialties text[];
    ALTER TABLE public.roasters ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
    ALTER TABLE public.roasters ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
EXCEPTION
    WHEN duplicate_column THEN 
        NULL;
END $$;