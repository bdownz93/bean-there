-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.users;
DROP POLICY IF EXISTS "Enable update for users based on id" ON public.users;
DROP POLICY IF EXISTS "Enable read access for all user stats" ON public.user_stats;
DROP POLICY IF EXISTS "Enable insert for authenticated users stats" ON public.user_stats;
DROP POLICY IF EXISTS "Enable update for users stats based on id" ON public.user_stats;

-- Create more permissive policies for users table
CREATE POLICY "anyone_can_read_users"
    ON public.users FOR SELECT
    USING (true);

CREATE POLICY "authenticated_can_insert_users"
    ON public.users FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "users_can_update_own_profile"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);

-- Create more permissive policies for user_stats table
CREATE POLICY "anyone_can_read_user_stats"
    ON public.user_stats FOR SELECT
    USING (true);

CREATE POLICY "authenticated_can_insert_user_stats"
    ON public.user_stats FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "users_can_update_own_stats"
    ON public.user_stats FOR UPDATE
    USING (auth.uid() = user_id);

-- Ensure RLS is enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.user_stats TO authenticated;

-- Ensure tables have proper indexes
CREATE INDEX IF NOT EXISTS idx_users_id ON public.users(id);
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON public.user_stats(user_id);