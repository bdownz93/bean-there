-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view likes" ON public.review_likes;
DROP POLICY IF EXISTS "Authenticated users can like" ON public.review_likes;
DROP POLICY IF EXISTS "Users can remove their likes" ON public.review_likes;
DROP POLICY IF EXISTS "Anyone can view comments" ON public.review_comments;
DROP POLICY IF EXISTS "Authenticated users can comment" ON public.review_comments;
DROP POLICY IF EXISTS "Users can update their comments" ON public.review_comments;
DROP POLICY IF EXISTS "Users can delete their comments" ON public.review_comments;

-- Create tables for review interactions if they don't exist
CREATE TABLE IF NOT EXISTS public.review_likes (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    review_id uuid REFERENCES public.reviews(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, review_id)
);

CREATE TABLE IF NOT EXISTS public.review_comments (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    review_id uuid REFERENCES public.reviews(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.review_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_comments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view likes"
    ON public.review_likes FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can like"
    ON public.review_likes FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can remove their likes"
    ON public.review_likes FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view comments"
    ON public.review_comments FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can comment"
    ON public.review_comments FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their comments"
    ON public.review_comments FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their comments"
    ON public.review_comments FOR DELETE
    USING (auth.uid() = user_id);

-- Drop existing indexes if they exist
DROP INDEX IF EXISTS idx_review_likes_review_id;
DROP INDEX IF EXISTS idx_review_likes_user_id;
DROP INDEX IF EXISTS idx_review_comments_review_id;
DROP INDEX IF EXISTS idx_review_comments_user_id;

-- Add indexes
CREATE INDEX idx_review_likes_review_id ON public.review_likes(review_id);
CREATE INDEX idx_review_likes_user_id ON public.review_likes(user_id);
CREATE INDEX idx_review_comments_review_id ON public.review_comments(review_id);
CREATE INDEX idx_review_comments_user_id ON public.review_comments(user_id);