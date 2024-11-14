-- First, drop all existing tables and functions
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

-- Drop all existing policies
DROP POLICY IF EXISTS "Anyone can view roasters" ON public.roasters;
DROP POLICY IF EXISTS "Authenticated users can create roasters" ON public.roasters;
DROP POLICY IF EXISTS "Users can update their own roasters" ON public.roasters;
DROP POLICY IF EXISTS "Users can delete their own roasters" ON public.roasters;
DROP POLICY IF EXISTS "Users can view all users" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view all stats" ON public.user_stats;
DROP POLICY IF EXISTS "Users can update their own stats" ON public.user_stats;
DROP POLICY IF EXISTS "Anyone can view beans" ON public.beans;
DROP POLICY IF EXISTS "Authenticated users can create beans" ON public.beans;
DROP POLICY IF EXISTS "Users can update their own beans" ON public.beans;
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;
DROP POLICY IF EXISTS "Authenticated users can create reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can update their own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can delete their own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can view their own visited roasters" ON public.visited_roasters;
DROP POLICY IF EXISTS "Users can mark roasters as visited" ON public.visited_roasters;
DROP POLICY IF EXISTS "Users can remove their visited roasters" ON public.visited_roasters;

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

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roasters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visited_roasters ENABLE ROW LEVEL SECURITY;