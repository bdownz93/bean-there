-- Drop existing user_stats table if it exists
DROP TABLE IF EXISTS public.user_stats;

-- Create user_stats table with proper constraints
CREATE TABLE IF NOT EXISTS public.user_stats (
    user_id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    beans_tried INTEGER DEFAULT 0,
    roasters_visited INTEGER DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    unique_origins INTEGER DEFAULT 0,
    experience_points INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add favorite_coffee_styles to users table if not exists
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS favorite_coffee_styles TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Create or replace function to handle new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert into users table
    INSERT INTO public.users (
        id,
        username,
        name,
        avatar_url,
        bio,
        favorite_coffee_styles
    ) VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'name', SPLIT_PART(NEW.email, '@', 1)),
        'https://api.dicebear.com/7.x/avataaars/svg?seed=' || NEW.id,
        NULL,
        ARRAY[]::TEXT[]
    );

    -- Insert initial user stats
    INSERT INTO public.user_stats (
        user_id,
        beans_tried,
        roasters_visited,
        total_reviews,
        unique_origins,
        experience_points,
        level
    ) VALUES (
        NEW.id,
        0,
        0,
        0,
        0,
        0,
        1
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for user_stats
CREATE TRIGGER update_user_stats_updated_at
    BEFORE UPDATE ON public.user_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to update user stats
CREATE OR REPLACE FUNCTION public.update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update total reviews
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
        experience_points = (
            SELECT COUNT(*) * 10
            FROM public.reviews
            WHERE user_id = NEW.user_id
        ),
        level = GREATEST(1, FLOOR(SQRT((
            SELECT COUNT(*) 
            FROM public.reviews 
            WHERE user_id = NEW.user_id
        ) / 10)) + 1)::INTEGER,
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = NEW.user_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;