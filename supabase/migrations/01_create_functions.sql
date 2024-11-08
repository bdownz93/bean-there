-- Create function to handle new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    username_val TEXT;
    name_val TEXT;
BEGIN
    -- Get username from metadata or generate from email
    username_val := COALESCE(
        NEW.raw_user_meta_data->>'username',
        SPLIT_PART(NEW.email, '@', 1)
    );
    
    -- Get name from metadata or use username
    name_val := COALESCE(
        NEW.raw_user_meta_data->>'name',
        username_val
    );

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
        username_val,
        name_val,
        'https://api.dicebear.com/7.x/avataaars/svg?seed=' || NEW.id,
        NULL,
        ARRAY[]::TEXT[]
    )
    ON CONFLICT (id) DO NOTHING;

    -- Insert initial user stats
    INSERT INTO public.user_stats (
        user_id,
        beans_tried,
        roasters_visited,
        total_reviews,
        unique_origins,
        roasters_created,
        experience_points,
        level
    ) VALUES (
        NEW.id,
        0,
        0,
        0,
        0,
        0,
        0,
        1
    )
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to handle new roasters
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

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update user stats
CREATE OR REPLACE FUNCTION public.update_user_stats(user_id_param uuid)
RETURNS void AS $$
BEGIN
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

    -- Insert if not exists
    IF NOT FOUND THEN
        INSERT INTO public.user_stats (
            user_id,
            beans_tried,
            roasters_visited,
            total_reviews,
            unique_origins,
            roasters_created,
            experience_points,
            level
        ) VALUES (
            user_id_param,
            0,
            0,
            0,
            0,
            0,
            0,
            1
        );
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;