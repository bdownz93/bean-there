-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.users;
DROP POLICY IF EXISTS "Enable update for users based on id" ON public.users;
DROP POLICY IF EXISTS "Enable read access for all user stats" ON public.user_stats;
DROP POLICY IF EXISTS "Enable insert for authenticated users stats" ON public.user_stats;
DROP POLICY IF EXISTS "Enable update for users stats based on id" ON public.user_stats;

-- Create new policies for users table
CREATE POLICY "Enable read access for all users"
    ON public.users FOR SELECT
    USING (true);

CREATE POLICY "Enable insert for authenticated users"
    ON public.users FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for users based on id"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);

-- Create new policies for user_stats table
CREATE POLICY "Enable read access for all user stats"
    ON public.user_stats FOR SELECT
    USING (true);

CREATE POLICY "Enable insert for authenticated users stats"
    ON public.user_stats FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for users stats based on id"
    ON public.user_stats FOR UPDATE
    USING (auth.uid() = user_id);

-- Ensure RLS is enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.user_stats TO authenticated;

-- Create or replace the handle_new_user function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO public.users (
        id,
        username,
        name,
        avatar_url,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'name', SPLIT_PART(NEW.email, '@', 1)),
        'https://api.dicebear.com/7.x/avataaars/svg?seed=' || NEW.id,
        NOW(),
        NOW()
    );

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
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;