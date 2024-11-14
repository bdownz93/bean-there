-- Create review_likes table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.review_likes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    review_id uuid REFERENCES public.reviews(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, review_id)
);

-- Create review_comments table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.review_comments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    review_id uuid REFERENCES public.reviews(id) ON DELETE CASCADE NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on both tables
ALTER TABLE public.review_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_comments ENABLE ROW LEVEL SECURITY;

-- Set up RLS policies for review_likes
DROP POLICY IF EXISTS "Enable read access for all users" ON public.review_likes;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.review_likes;
DROP POLICY IF EXISTS "Enable delete for own likes" ON public.review_likes;

CREATE POLICY "Enable read access for all users" ON public.review_likes
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON public.review_likes
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable delete for own likes" ON public.review_likes
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id);

-- Set up RLS policies for review_comments
DROP POLICY IF EXISTS "Enable read access for all users" ON public.review_comments;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.review_comments;
DROP POLICY IF EXISTS "Enable update for own comments" ON public.review_comments;
DROP POLICY IF EXISTS "Enable delete for own comments" ON public.review_comments;

CREATE POLICY "Enable read access for all users" ON public.review_comments
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON public.review_comments
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for own comments" ON public.review_comments
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Enable delete for own comments" ON public.review_comments
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON public.review_likes TO authenticated;
GRANT ALL ON public.review_comments TO authenticated;
