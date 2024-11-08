-- Drop and recreate visited_roasters table with proper constraints
DROP TABLE IF EXISTS public.visited_roasters CASCADE;

CREATE TABLE public.visited_roasters (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    roaster_id uuid REFERENCES public.roasters(id) ON DELETE CASCADE,
    visited_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, roaster_id)
);

-- Enable RLS
ALTER TABLE public.visited_roasters ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own visited roasters"
ON public.visited_roasters FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can mark roasters as visited"
ON public.visited_roasters FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their visited roasters"
ON public.visited_roasters FOR DELETE
USING (auth.uid() = user_id);

-- Create function to update user stats when roasters are visited/unvisited
CREATE OR REPLACE FUNCTION public.update_visited_roaster_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Update stats for new visit
        UPDATE public.user_stats
        SET 
            roasters_visited = (
                SELECT COUNT(*)
                FROM public.visited_roasters
                WHERE user_id = NEW.user_id
            ),
            experience_points = experience_points + 25,
            level = GREATEST(1, FLOOR(SQRT((experience_points + 25) / 100)) + 1)::INTEGER,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = NEW.user_id;
        
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Update stats for removed visit
        UPDATE public.user_stats
        SET 
            roasters_visited = (
                SELECT COUNT(*)
                FROM public.visited_roasters
                WHERE user_id = OLD.user_id
            ),
            experience_points = GREATEST(0, experience_points - 25),
            level = GREATEST(1, FLOOR(SQRT((experience_points - 25) / 100)) + 1)::INTEGER,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = OLD.user_id;
        
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for visited roasters
DROP TRIGGER IF EXISTS update_stats_visited_roasters ON public.visited_roasters;
CREATE TRIGGER update_stats_visited_roasters
    AFTER INSERT OR DELETE ON public.visited_roasters
    FOR EACH ROW
    EXECUTE FUNCTION public.update_visited_roaster_stats();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_visited_roasters_user_id ON public.visited_roasters(user_id);
CREATE INDEX IF NOT EXISTS idx_visited_roasters_roaster_id ON public.visited_roasters(roaster_id);

-- Update roasters table to ensure created_by is properly handled
ALTER TABLE public.roasters ALTER COLUMN created_by SET DEFAULT auth.uid();

-- Update existing roasters to set created_by if missing
UPDATE public.roasters 
SET created_by = (SELECT id FROM auth.users LIMIT 1)
WHERE created_by IS NULL;

-- Ensure all users have stats records
INSERT INTO public.user_stats (
    user_id,
    beans_tried,
    roasters_visited,
    total_reviews,
    unique_origins,
    roasters_created,
    experience_points,
    level
)
SELECT 
    u.id,
    0,
    COALESCE((SELECT COUNT(*) FROM public.visited_roasters WHERE user_id = u.id), 0),
    COALESCE((SELECT COUNT(*) FROM public.reviews WHERE user_id = u.id), 0),
    0,
    COALESCE((SELECT COUNT(*) FROM public.roasters WHERE created_by = u.id), 0),
    0,
    1
FROM auth.users u
WHERE NOT EXISTS (
    SELECT 1 FROM public.user_stats WHERE user_id = u.id
)
ON CONFLICT (user_id) DO UPDATE
SET 
    roasters_visited = EXCLUDED.roasters_visited,
    total_reviews = EXCLUDED.total_reviews,
    roasters_created = EXCLUDED.roasters_created,
    updated_at = CURRENT_TIMESTAMP;