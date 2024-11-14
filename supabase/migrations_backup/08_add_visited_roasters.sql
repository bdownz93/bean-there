-- Create visited_roasters table to track which roasters users have visited
CREATE TABLE IF NOT EXISTS public.visited_roasters (
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    roaster_id uuid REFERENCES public.roasters(id) ON DELETE CASCADE,
    visited_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (user_id, roaster_id)
);

-- Enable RLS on visited_roasters
ALTER TABLE public.visited_roasters ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own visited roasters" ON public.visited_roasters;
DROP POLICY IF EXISTS "Users can mark roasters as visited" ON public.visited_roasters;
DROP POLICY IF EXISTS "Users can unmark their visited roasters" ON public.visited_roasters;

-- Create policies for visited_roasters
CREATE POLICY "Users can view their own visited roasters"
    ON public.visited_roasters FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can mark roasters as visited"
    ON public.visited_roasters FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unmark their visited roasters"
    ON public.visited_roasters FOR DELETE
    USING (auth.uid() = user_id);

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.update_user_stats(uuid);

-- Create the function with explicit parameter
CREATE OR REPLACE FUNCTION public.update_user_stats(user_id_param uuid)
RETURNS void AS $$
BEGIN
    UPDATE public.user_stats
    SET 
        total_reviews = (
            SELECT COUNT(*)
            FROM public.reviews
            WHERE user_id = user_id_param
        ),
        beans_tried = (
            SELECT COUNT(DISTINCT bean_id)
            FROM public.reviews
            WHERE user_id = user_id_param
        ),
        unique_origins = (
            SELECT COUNT(DISTINCT b.origin)
            FROM public.reviews r
            JOIN public.beans b ON r.bean_id = b.id
            WHERE r.user_id = user_id_param
        ),
        roasters_visited = (
            SELECT COUNT(*)
            FROM public.visited_roasters
            WHERE user_id = user_id_param
        ),
        roasters_created = (
            SELECT COUNT(*)
            FROM public.roasters
            WHERE created_by = user_id_param
        ),
        experience_points = (
            SELECT (
                (COUNT(*) * 10) + -- Points for reviews
                ((SELECT COUNT(*) FROM public.roasters WHERE created_by = user_id_param) * 50) + -- Points for creating roasters
                ((SELECT COUNT(*) FROM public.visited_roasters WHERE user_id = user_id_param) * 25) -- Points for visiting roasters
            )
            FROM public.reviews
            WHERE user_id = user_id_param
        ),
        level = GREATEST(1, FLOOR(SQRT((
            SELECT (
                (COUNT(*) * 10) + -- Review contribution to level
                ((SELECT COUNT(*) FROM public.roasters WHERE created_by = user_id_param) * 50) + -- Roaster contribution to level
                ((SELECT COUNT(*) FROM public.visited_roasters WHERE user_id = user_id_param) * 25) -- Visited roasters contribution to level
            )
            FROM public.reviews 
            WHERE user_id = user_id_param
        ) / 100)) + 1)::INTEGER,
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = user_id_param;

    -- Insert a new record if it doesn't exist
    INSERT INTO public.user_stats (user_id, total_reviews, beans_tried, unique_origins, roasters_visited, roasters_created, experience_points, level)
    SELECT 
        user_id_param,
        0, -- total_reviews
        0, -- beans_tried
        0, -- unique_origins
        0, -- roasters_visited
        0, -- roasters_created
        0, -- experience_points
        1  -- level
    WHERE NOT EXISTS (
        SELECT 1 FROM public.user_stats WHERE user_id = user_id_param
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for automatic stats updates
CREATE OR REPLACE FUNCTION public.trigger_update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM public.update_user_stats(
        CASE 
            WHEN TG_OP = 'DELETE' THEN OLD.user_id
            ELSE NEW.user_id
        END
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_stats_on_review ON public.reviews;
DROP TRIGGER IF EXISTS update_stats_on_visited ON public.visited_roasters;
DROP TRIGGER IF EXISTS update_stats_on_roaster ON public.roasters;

-- Add triggers to relevant tables
CREATE TRIGGER update_stats_on_review
    AFTER INSERT OR UPDATE OR DELETE ON public.reviews
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_update_user_stats();

CREATE TRIGGER update_stats_on_visited
    AFTER INSERT OR DELETE ON public.visited_roasters
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_update_user_stats();

CREATE TRIGGER update_stats_on_roaster
    AFTER INSERT ON public.roasters
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_update_user_stats();