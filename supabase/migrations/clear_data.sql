-- Disable RLS temporarily to allow deleting all data
ALTER TABLE public.comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_likes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.beans DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.roasters DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.bean_ratings DISABLE ROW LEVEL SECURITY;

-- Delete data in order of dependencies
DELETE FROM public.comment_likes;
DELETE FROM public.comments;
DELETE FROM public.follows;
DELETE FROM public.notifications;
DELETE FROM public.saved_items;
DELETE FROM public.user_badges;
DELETE FROM public.bean_ratings;
DELETE FROM public.reviews;
DELETE FROM public.beans;
DELETE FROM public.roasters;

-- Re-enable RLS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roasters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bean_ratings ENABLE ROW LEVEL SECURITY;
