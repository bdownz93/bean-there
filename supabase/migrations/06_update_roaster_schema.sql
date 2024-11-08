-- Add created_by column to roasters if it doesn't exist
ALTER TABLE public.roasters
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);

-- Update RLS policies for roasters table
DROP POLICY IF EXISTS "Anyone can view roasters" ON public.roasters;
DROP POLICY IF EXISTS "Authenticated users can create roasters" ON public.roasters;
DROP POLICY IF EXISTS "Users can update their own roasters" ON public.roasters;

-- Create new policies
CREATE POLICY "Anyone can view roasters"
ON public.roasters FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create roasters"
ON public.roasters FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own roasters"
ON public.roasters FOR UPDATE
USING (auth.uid() = created_by);

-- Create function to handle roaster creation
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

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new roasters
DROP TRIGGER IF EXISTS on_roaster_created ON public.roasters;
CREATE TRIGGER on_roaster_created
    BEFORE INSERT ON public.roasters
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_roaster();

-- Update existing roasters to ensure valid data
UPDATE public.roasters
SET slug = LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g'))
WHERE slug IS NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS roasters_slug_idx ON public.roasters(slug);
CREATE INDEX IF NOT EXISTS roasters_created_by_idx ON public.roasters(created_by);