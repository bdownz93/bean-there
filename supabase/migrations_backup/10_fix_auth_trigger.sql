-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create the function with better error handling
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
    );

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
    );

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Log the error
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Ensure tables exist with proper constraints
CREATE TABLE IF NOT EXISTS public.users (
    id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    username TEXT UNIQUE,
    name TEXT,
    avatar_url TEXT,
    bio TEXT,
    favorite_coffee_styles TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.user_stats (
    user_id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    beans_tried INTEGER DEFAULT 0,
    roasters_visited INTEGER DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    unique_origins INTEGER DEFAULT 0,
    roasters_created INTEGER DEFAULT 0,
    experience_points INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all users"
    ON public.users FOR SELECT
    USING (true);

CREATE POLICY "Users can update their own profile"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can view all stats"
    ON public.user_stats FOR SELECT
    USING (true);

CREATE POLICY "Users can update their own stats"
    ON public.user_stats FOR UPDATE
    USING (auth.uid() = user_id);

-- Backfill any missing users
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

-- Backfill any missing stats
INSERT INTO public.user_stats (user_id, level, experience_points, created_at, updated_at)
SELECT 
    id,
    1,
    0,
    NOW(),
    NOW()
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_stats)
ON CONFLICT (user_id) DO NOTHING;