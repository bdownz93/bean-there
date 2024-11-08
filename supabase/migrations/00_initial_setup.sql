-- Drop all existing tables and functions
DROP TABLE IF EXISTS public.visited_roasters CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.beans CASCADE;
DROP TABLE IF EXISTS public.roasters CASCADE;
DROP TABLE IF EXISTS public.user_stats CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Drop all existing functions
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user_stats() CASCADE;
DROP FUNCTION IF EXISTS public.update_user_stats() CASCADE;
DROP FUNCTION IF EXISTS public.update_visited_roaster_stats() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_roaster() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.trigger_update_user_stats() CASCADE;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create base tables
CREATE TABLE public.users (
    id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    username TEXT UNIQUE,
    name TEXT,
    avatar_url TEXT,
    bio TEXT,
    favorite_coffee_styles TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.user_stats (
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

CREATE TABLE public.roasters (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_by uuid REFERENCES auth.users(id),
    slug TEXT UNIQUE,
    name TEXT NOT NULL,
    location TEXT,
    description TEXT,
    logo_url TEXT,
    rating DECIMAL(3,2) DEFAULT 0,
    coordinates JSONB DEFAULT '{"lat": 0, "lng": 0}'::jsonb,
    specialties TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.beans (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_by uuid REFERENCES auth.users(id),
    roaster_id uuid REFERENCES public.roasters(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    origin TEXT,
    process TEXT,
    roast_level TEXT,
    description TEXT,
    price DECIMAL(10,2),
    rating DECIMAL(3,2) DEFAULT 0,
    image_url TEXT,
    tasting_notes TEXT[] DEFAULT ARRAY[]::TEXT[],
    flavor_profile JSONB,
    altitude TEXT,
    variety TEXT,
    harvest TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.reviews (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    bean_id uuid REFERENCES public.beans(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    content TEXT,
    brew_method TEXT,
    flavor_notes TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.visited_roasters (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    roaster_id uuid REFERENCES public.roasters(id) ON DELETE CASCADE,
    visited_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, roaster_id)
);

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

-- Create triggers
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roasters_updated_at
    BEFORE UPDATE ON public.roasters
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_beans_updated_at
    BEFORE UPDATE ON public.beans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
    BEFORE UPDATE ON public.reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roasters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visited_roasters ENABLE ROW LEVEL SECURITY;

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

CREATE POLICY "Anyone can view roasters"
    ON public.roasters FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can create roasters"
    ON public.roasters FOR INSERT
    WITH CHECK (
        auth.role() = 'authenticated' AND
        (created_by IS NULL OR created_by = auth.uid())
    );

CREATE POLICY "Users can update their own roasters"
    ON public.roasters FOR UPDATE
    USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own roasters"
    ON public.roasters FOR DELETE
    USING (auth.uid() = created_by);

CREATE POLICY "Anyone can view beans"
    ON public.beans FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can create beans"
    ON public.beans FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own beans"
    ON public.beans FOR UPDATE
    USING (auth.uid() = created_by);

CREATE POLICY "Anyone can view reviews"
    ON public.reviews FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can create reviews"
    ON public.reviews FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
    ON public.reviews FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
    ON public.reviews FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own visited roasters"
    ON public.visited_roasters FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can mark roasters as visited"
    ON public.visited_roasters FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their visited roasters"
    ON public.visited_roasters FOR DELETE
    USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_roasters_slug ON public.roasters(slug);
CREATE INDEX IF NOT EXISTS idx_roasters_created_by ON public.roasters(created_by);
CREATE INDEX IF NOT EXISTS idx_beans_slug ON public.beans(slug);
CREATE INDEX IF NOT EXISTS idx_beans_roaster_id ON public.beans(roaster_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_bean_id ON public.reviews(bean_id);
CREATE INDEX IF NOT EXISTS idx_visited_roasters_user_id ON public.visited_roasters(user_id);
CREATE INDEX IF NOT EXISTS idx_visited_roasters_roaster_id ON public.visited_roasters(roaster_id);