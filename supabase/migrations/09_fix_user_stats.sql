-- Drop and recreate the update_user_stats function with proper error handling
CREATE OR REPLACE FUNCTION public.update_user_stats(user_id_param uuid)
RETURNS void AS $$
BEGIN
    -- First try to update existing stats
    UPDATE public.user_stats
    SET 
        total_reviews = COALESCE((
            SELECT COUNT(*)
            FROM public.reviews
            WHERE user_id = user_id_param
        ), 0),
        beans_tried = COALESCE((
            SELECT COUNT(DISTINCT bean_id)
            FROM public.reviews
            WHERE user_id = user_id_param
        ), 0),
        unique_origins = COALESCE((
            SELECT COUNT(DISTINCT b.origin)
            FROM public.reviews r
            JOIN public.beans b ON r.bean_id = b.id
            WHERE r.user_id = user_id_param
        ), 0),
        roasters_visited = COALESCE((
            SELECT COUNT(*)
            FROM public.visited_roasters
            WHERE user_id = user_id_param
        ), 0),
        roasters_created = COALESCE((
            SELECT COUNT(*)
            FROM public.roasters
            WHERE created_by = user_id_param
        ), 0),
        experience_points = COALESCE((
            SELECT (
                (COUNT(*) * 10) + -- Points for reviews
                ((SELECT COUNT(*) FROM public.roasters WHERE created_by = user_id_param) * 50) + -- Points for creating roasters
                ((SELECT COUNT(*) FROM public.visited_roasters WHERE user_id = user_id_param) * 25) -- Points for visiting roasters
            )
            FROM public.reviews
            WHERE user_id = user_id_param
        ), 0),
        level = GREATEST(1, FLOOR(SQRT(COALESCE((
            SELECT (
                (COUNT(*) * 10) + -- Review contribution to level
                ((SELECT COUNT(*) FROM public.roasters WHERE created_by = user_id_param) * 50) + -- Roaster contribution to level
                ((SELECT COUNT(*) FROM public.visited_roasters WHERE user_id = user_id_param) * 25) -- Visited roasters contribution to level
            )
            FROM public.reviews 
            WHERE user_id = user_id_param
        ), 0) / 100)) + 1)::INTEGER,
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = user_id_param;

    -- If no row was updated, insert a new one
    IF NOT FOUND THEN
        INSERT INTO public.user_stats (
            user_id,
            total_reviews,
            beans_tried,
            unique_origins,
            roasters_visited,
            roasters_created,
            experience_points,
            level
        )
        VALUES (
            user_id_param,
            0, -- total_reviews
            0, -- beans_tried
            0, -- unique_origins
            0, -- roasters_visited
            0, -- roasters_created
            0, -- experience_points
            1  -- level
        );
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure all users have stats
INSERT INTO public.user_stats (user_id, level, experience_points)
SELECT id, 1, 0
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_stats);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_visited_roasters_user_id ON public.visited_roasters(user_id);
CREATE INDEX IF NOT EXISTS idx_visited_roasters_roaster_id ON public.visited_roasters(roaster_id);
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON public.user_stats(user_id);

-- Update all user stats
DO $$
DECLARE
    user_record RECORD;
BEGIN
    FOR user_record IN SELECT id FROM auth.users
    LOOP
        PERFORM public.update_user_stats(user_record.id);
    END LOOP;
END $$;