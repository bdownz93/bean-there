-- Create likes table
CREATE TABLE IF NOT EXISTS public.review_likes (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    review_id uuid REFERENCES public.reviews(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(review_id, user_id)
);

-- Create comments table
CREATE TABLE IF NOT EXISTS public.review_comments (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    review_id uuid REFERENCES public.reviews(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.review_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_comments ENABLE ROW LEVEL SECURITY;

-- Create policies for likes
CREATE POLICY "Anyone can view likes"
    ON public.review_likes FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can create likes"
    ON public.review_likes FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own likes"
    ON public.review_likes FOR DELETE
    USING (auth.uid() = user_id);

-- Create policies for comments
CREATE POLICY "Anyone can view comments"
    ON public.review_comments FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can create comments"
    ON public.review_comments FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own comments"
    ON public.review_comments FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
    ON public.review_comments FOR DELETE
    USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_review_likes_review_id ON public.review_likes(review_id);
CREATE INDEX idx_review_likes_user_id ON public.review_likes(user_id);
CREATE INDEX idx_review_comments_review_id ON public.review_comments(review_id);
CREATE INDEX idx_review_comments_user_id ON public.review_comments(user_id);