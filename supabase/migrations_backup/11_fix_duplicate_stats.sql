-- Drop existing triggers and functions
DROP TRIGGER IF EXISTS on_user_created_add_stats ON public.users;
DROP FUNCTION IF EXISTS public.handle_new_user_stats();
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create a single function to handle new users and their stats
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
        favorite_coffee_styles,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        username_val,
        name_val,
        'https://api.dicebear.com/7.x/avataaars/svg?seed=' || NEW.id,
        NULL,
        ARRAY[]::TEXT[],
        NOW(),
        NOW()
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
        level,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        0,
        0,
        0,
        0,
        0,
        0,
        1,
        NOW(),
        NOW()
    )
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Log the error
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the auth trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Ensure all existing users have stats
DO $$
BEGIN
    -- Add missing user records
    INSERT INTO public.users (id, username, name, avatar_url, created_at, updated_at)
    SELECT 
        id,
        COALESCE(raw_user_meta_data->>'username', SPLIT_PART(email, '@', 1)),
        COALESCE(raw_user_meta_data->>'name', SPLIT_PART(email, '@', 1)),
        'https://api.dicebear.com/7.x/avataaars/svg?seed=' || id,
        created_at,
        created_at
    FROM auth.users
    WHERE id NOT IN (SELECT id FROM public.users)
    ON CONFLICT (id) DO NOTHING;

    -- Add missing stats records
    INSERT INTO public.user_stats (
        user_id,
        beans_tried,
        roasters_visited,
        total_reviews,
        unique_origins,
        roasters_created,
        experience_points,
        level,
        created_at,
        updated_at
    )
    SELECT 
        id,
        0,
        0,
        0,
        0,
        0,
        0,
        1,
        NOW(),
        NOW()
    FROM auth.users
    WHERE id NOT IN (SELECT user_id FROM public.user_stats)
    ON CONFLICT (user_id) DO NOTHING;
END $$;