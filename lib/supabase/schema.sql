-- Create tables
CREATE TABLE IF NOT EXISTS public.roasters (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_by uuid REFERENCES auth.users(id),
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

-- Create visited_roasters table
CREATE TABLE IF NOT EXISTS public.visited_roasters (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    roaster_id uuid REFERENCES public.roasters(id) ON DELETE CASCADE,
    visited_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, roaster_id)
);

-- Enable RLS
ALTER TABLE public.roasters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visited_roasters ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view roasters" ON public.roasters
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create roasters" ON public.roasters
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own roasters" ON public.roasters
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own roasters" ON public.roasters
    FOR DELETE USING (auth.uid() = created_by);

CREATE POLICY "Users can view their own visited roasters" ON public.visited_roasters
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can mark roasters as visited" ON public.visited_roasters
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unmark visited roasters" ON public.visited_roasters
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to update user stats when marking roasters as visited
CREATE OR REPLACE FUNCTION public.update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.user_stats
    SET roasters_visited = (
        SELECT COUNT(DISTINCT roaster_id)
        FROM public.visited_roasters
        WHERE user_id = NEW.user_id
    )
    WHERE user_id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating stats
CREATE TRIGGER update_stats_on_visit
    AFTER INSERT OR DELETE ON public.visited_roasters
    FOR EACH ROW
    EXECUTE FUNCTION public.update_user_stats();