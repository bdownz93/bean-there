-- Add user stats table
CREATE TABLE IF NOT EXISTS public.user_stats (
    user_id uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    beans_tried INTEGER DEFAULT 0,
    roasters_visited INTEGER DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    unique_origins INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create trigger to automatically create user stats
CREATE OR REPLACE FUNCTION public.handle_new_user_stats()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_stats (user_id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_user_created_add_stats
    AFTER INSERT ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user_stats();

-- Create function to update user stats
CREATE OR REPLACE FUNCTION public.update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update total reviews
    UPDATE public.user_stats
    SET total_reviews = (
        SELECT COUNT(*)
        FROM public.reviews
        WHERE user_id = NEW.user_id
    )
    WHERE user_id = NEW.user_id;

    -- Update beans tried
    UPDATE public.user_stats
    SET beans_tried = (
        SELECT COUNT(DISTINCT bean_id)
        FROM public.reviews
        WHERE user_id = NEW.user_id
    )
    WHERE user_id = NEW.user_id;

    -- Update unique origins
    UPDATE public.user_stats
    SET unique_origins = (
        SELECT COUNT(DISTINCT b.origin)
        FROM public.reviews r
        JOIN public.beans b ON r.bean_id = b.id
        WHERE r.user_id = NEW.user_id
    )
    WHERE user_id = NEW.user_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update stats when reviews are added
CREATE TRIGGER update_stats_on_review
    AFTER INSERT OR UPDATE OR DELETE ON public.reviews
    FOR EACH ROW
    EXECUTE FUNCTION public.update_user_stats();