-- Drop existing policies
DROP POLICY IF EXISTS "Users can view all users" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view all stats" ON public.user_stats;
DROP POLICY IF EXISTS "Users can update their own stats" ON public.user_stats;

-- Create more permissive policies for users table
CREATE POLICY "Enable read access for all users"
    ON public.users FOR SELECT
    USING (true);

CREATE POLICY "Enable insert for authenticated users"
    ON public.users FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update for users based on id"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);

-- Create more permissive policies for user_stats table
CREATE POLICY "Enable read access for all user stats"
    ON public.user_stats FOR SELECT
    USING (true);

CREATE POLICY "Enable insert for authenticated users stats"
    ON public.user_stats FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for users stats based on id"
    ON public.user_stats FOR UPDATE
    USING (auth.uid() = user_id);

-- Update handle_new_user function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
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

    BEGIN
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

    EXCEPTION 
        WHEN unique_violation THEN
            -- Handle duplicate key violations gracefully
            UPDATE public.users
            SET 
                username = username_val,
                name = name_val,
                updated_at = NOW()
            WHERE id = NEW.id;
            
            UPDATE public.user_stats
            SET updated_at = NOW()
            WHERE user_id = NEW.id;
            
        WHEN OTHERS THEN
            RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    END;

    RETURN NEW;
END;
$$;