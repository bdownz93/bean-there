-- Create user_visited_roasters table
CREATE TABLE IF NOT EXISTS public.user_visited_roasters (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES public.users ON DELETE CASCADE,
    roaster_id uuid REFERENCES public.roasters ON DELETE CASCADE,
    visited boolean DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, roaster_id)
);

-- Enable RLS
ALTER TABLE public.user_visited_roasters ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own visited roasters"
    ON public.user_visited_roasters
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own visited roasters"
    ON public.user_visited_roasters
    FOR ALL
    USING (auth.uid() = user_id);