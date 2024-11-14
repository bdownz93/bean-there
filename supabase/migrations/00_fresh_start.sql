-- Start fresh by dropping everything
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create base tables with proper constraints
CREATE TABLE public.users (
    id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    favorite_coffee_styles TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT valid_username CHECK (length(username) >= 3 AND length(username) <= 30)
);

CREATE TABLE public.user_stats (
    user_id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    beans_tried INTEGER DEFAULT 0 CHECK (beans_tried >= 0),
    roasters_visited INTEGER DEFAULT 0 CHECK (roasters_visited >= 0),
    total_reviews INTEGER DEFAULT 0 CHECK (total_reviews >= 0),
    unique_origins INTEGER DEFAULT 0 CHECK (unique_origins >= 0),
    roasters_created INTEGER DEFAULT 0 CHECK (roasters_created >= 0),
    experience_points INTEGER DEFAULT 0 CHECK (experience_points >= 0),
    level INTEGER DEFAULT 1 CHECK (level >= 1),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.roasters (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_by uuid REFERENCES auth.users(id),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    location TEXT,
    description TEXT,
    logo_url TEXT,
    website_url TEXT,
    rating DECIMAL(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    coordinates JSONB DEFAULT '{"lat": 0, "lng": 0}'::jsonb,
    specialties TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT valid_slug CHECK (length(slug) >= 3 AND length(slug) <= 100)
);

CREATE TABLE public.beans (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_by uuid REFERENCES auth.users(id),
    roaster_id uuid REFERENCES public.roasters(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    origin TEXT,
    process TEXT,
    roast_level TEXT,
    description TEXT,
    price DECIMAL(10,2) CHECK (price >= 0),
    rating DECIMAL(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    image_url TEXT,
    tasting_notes TEXT[] DEFAULT ARRAY[]::TEXT[],
    flavor_profile JSONB,
    altitude TEXT,
    variety TEXT,
    harvest TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT valid_slug CHECK (length(slug) >= 3 AND length(slug) <= 100)
);

CREATE TABLE public.reviews (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    bean_id uuid REFERENCES public.beans(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    content TEXT,
    brew_method TEXT,
    photo_url TEXT,
    aroma INTEGER CHECK (aroma >= 1 AND aroma <= 5),
    body INTEGER CHECK (body >= 1 AND body <= 5),
    acidity INTEGER CHECK (acidity >= 1 AND acidity <= 5),
    sweetness INTEGER CHECK (sweetness >= 1 AND sweetness <= 5),
    aftertaste INTEGER CHECK (aftertaste >= 1 AND aftertaste <= 5),
    flavor_notes TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_user_bean UNIQUE(user_id, bean_id)
);

CREATE TABLE public.visited_roasters (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    roaster_id uuid REFERENCES public.roasters(id) ON DELETE CASCADE,
    visited_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, roaster_id)
);

-- Create indexes for better performance
CREATE INDEX idx_beans_slug ON public.beans(slug);
CREATE INDEX idx_beans_roaster_id ON public.beans(roaster_id);
CREATE INDEX idx_beans_rating ON public.beans(rating);
CREATE INDEX idx_roasters_slug ON public.roasters(slug);
CREATE INDEX idx_roasters_rating ON public.roasters(rating);
CREATE INDEX idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX idx_reviews_bean_id ON public.reviews(bean_id);
CREATE INDEX idx_reviews_rating ON public.reviews(rating);

-- Create materialized view for featured beans
CREATE MATERIALIZED VIEW featured_beans AS
SELECT 
    b.*,
    r.name as roaster_name,
    r.slug as roaster_slug,
    COUNT(rv.id) as review_count,
    COALESCE(AVG(rv.rating), 0) as average_rating
FROM public.beans b
LEFT JOIN public.roasters r ON b.roaster_id = r.id
LEFT JOIN public.reviews rv ON b.id = rv.bean_id
GROUP BY b.id, r.id
ORDER BY average_rating DESC, review_count DESC
LIMIT 10;

CREATE UNIQUE INDEX featured_beans_id_idx ON featured_beans (id);

-- Create functions for updating stats and handling new users
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
        avatar_url
    ) VALUES (
        NEW.id,
        username_val,
        name_val,
        'https://api.dicebear.com/7.x/avataaars/svg?seed=' || NEW.id
    )
    ON CONFLICT (id) DO NOTHING;

    -- Insert initial user stats
    INSERT INTO public.user_stats (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_featured_beans()
RETURNS TRIGGER AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY featured_beans;
    RETURN NULL;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error refreshing featured_beans view: %', SQLERRM;
        RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_users_timestamp
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_user_stats_timestamp
    BEFORE UPDATE ON public.user_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_roasters_timestamp
    BEFORE UPDATE ON public.roasters
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_beans_timestamp
    BEFORE UPDATE ON public.beans
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_reviews_timestamp
    BEFORE UPDATE ON public.reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER refresh_featured_beans_on_review
    AFTER INSERT OR UPDATE OR DELETE ON public.reviews
    FOR EACH STATEMENT
    EXECUTE FUNCTION refresh_featured_beans();

CREATE TRIGGER refresh_featured_beans_on_bean
    AFTER INSERT OR UPDATE OR DELETE ON public.beans
    FOR EACH STATEMENT
    EXECUTE FUNCTION refresh_featured_beans();

-- Create trigger for new users
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roasters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visited_roasters ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view all users"
    ON public.users FOR SELECT
    USING (true);

CREATE POLICY "Users can update their own profile"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can view their own stats"
    ON public.user_stats FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view roasters"
    ON public.roasters FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can create roasters"
    ON public.roasters FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update roasters they created"
    ON public.roasters FOR UPDATE
    USING (auth.uid() = created_by);

CREATE POLICY "Anyone can view beans"
    ON public.beans FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can create beans"
    ON public.beans FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update beans they created"
    ON public.beans FOR UPDATE
    USING (auth.uid() = created_by);

CREATE POLICY "Anyone can view reviews"
    ON public.reviews FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can create reviews"
    ON public.reviews FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own reviews"
    ON public.reviews FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
    ON public.reviews FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view visited roasters"
    ON public.visited_roasters FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can mark roasters as visited"
    ON public.visited_roasters FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove visited roasters"
    ON public.visited_roasters FOR DELETE
    USING (auth.uid() = user_id);
