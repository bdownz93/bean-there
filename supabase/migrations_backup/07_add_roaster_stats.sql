-- Add roasters_created to user_stats table
ALTER TABLE public.user_stats
ADD COLUMN IF NOT EXISTS roasters_created INTEGER DEFAULT 0;

-- Update the update_user_stats function to include roasters_created
CREATE OR REPLACE FUNCTION public.update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.user_stats
    SET 
        total_reviews = (
            SELECT COUNT(*)
            FROM public.reviews
            WHERE user_id = NEW.user_id
        ),
        beans_tried = (
            SELECT COUNT(DISTINCT bean_id)
            FROM public.reviews
            WHERE user_id = NEW.user_id
        ),
        unique_origins = (
            SELECT COUNT(DISTINCT b.origin)
            FROM public.reviews r
            JOIN public.beans b ON r.bean_id = b.id
            WHERE r.user_id = NEW.user_id
        ),
        roasters_created = (
            SELECT COUNT(*)
            FROM public.roasters
            WHERE created_by = NEW.user_id
        ),
        experience_points = (
            SELECT (
                (COUNT(*) * 10) + -- Points for reviews
                ((SELECT COUNT(*) FROM public.roasters WHERE created_by = NEW.user_id) * 50) -- Points for creating roasters
            )
            FROM public.reviews
            WHERE user_id = NEW.user_id
        ),
        level = GREATEST(1, FLOOR(SQRT((
            SELECT (
                (COUNT(*) * 10) + -- Review contribution to level
                ((SELECT COUNT(*) FROM public.roasters WHERE created_by = NEW.user_id) * 50) -- Roaster contribution to level
            )
            FROM public.reviews 
            WHERE user_id = NEW.user_id
        ) / 100)) + 1)::INTEGER,
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = NEW.user_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for roaster creation to update user stats
CREATE OR REPLACE FUNCTION public.update_stats_on_roaster_change()
RETURNS TRIGGER AS $$
BEGIN
    -- For INSERT
    IF TG_OP = 'INSERT' THEN
        -- Update stats for the user who created the roaster
        UPDATE public.user_stats
        SET 
            roasters_created = roasters_created + 1,
            experience_points = experience_points + 50,
            level = GREATEST(1, FLOOR(SQRT((experience_points + 50) / 100)) + 1)::INTEGER,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = NEW.created_by;
    -- For DELETE
    ELSIF TG_OP = 'DELETE' THEN
        -- Update stats for the user who deleted the roaster
        UPDATE public.user_stats
        SET 
            roasters_created = GREATEST(0, roasters_created - 1),
            experience_points = GREATEST(0, experience_points - 50),
            level = GREATEST(1, FLOOR(SQRT((experience_points - 50) / 100)) + 1)::INTEGER,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = OLD.created_by;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for roaster changes
DROP TRIGGER IF EXISTS update_stats_on_roaster_change ON public.roasters;
CREATE TRIGGER update_stats_on_roaster_change
    AFTER INSERT OR DELETE ON public.roasters
    FOR EACH ROW
    EXECUTE FUNCTION public.update_stats_on_roaster_change();