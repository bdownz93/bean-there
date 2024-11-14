-- Create tables first, without triggers
CREATE TABLE IF NOT EXISTS public.users (
    id uuid REFERENCES auth.users ON DELETE CASCADE,
    username TEXT UNIQUE,
    name TEXT,
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.roasters (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    slug TEXT UNIQUE,
    name TEXT NOT NULL,
    location TEXT,
    description TEXT,
    logo_url TEXT,
    rating DECIMAL(3,2),
    coordinates JSONB,
    specialties TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.beans (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    roaster_id uuid REFERENCES public.roasters ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    origin TEXT,
    process TEXT,
    roast_level TEXT,
    description TEXT,
    price DECIMAL(10,2),
    rating DECIMAL(3,2),
    image_url TEXT,
    tasting_notes TEXT[],
    flavor_profile JSONB,
    altitude TEXT,
    variety TEXT,
    harvest TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.reviews (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES public.users ON DELETE CASCADE,
    bean_id uuid REFERENCES public.beans ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    content TEXT,
    brew_method TEXT,
    flavor_notes TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roasters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all users" ON public.users
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Anyone can view roasters" ON public.roasters
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view beans" ON public.beans
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view reviews" ON public.reviews
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create reviews" ON public.reviews
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own reviews" ON public.reviews
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" ON public.reviews
    FOR DELETE USING (auth.uid() = user_id);

-- Create handle_new_user function and trigger
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, username, name, avatar_url)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'name',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=' || new.id
  );
  RETURN new;
END;
$$ language plpgsql security definer;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();