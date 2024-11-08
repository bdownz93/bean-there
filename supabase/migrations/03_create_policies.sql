-- Drop all existing policies first
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

-- Users table policies
CREATE POLICY "Users can view all users"
    ON public.users FOR SELECT
    USING (true);

CREATE POLICY "Users can update their own profile"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);

-- User stats policies
CREATE POLICY "Users can view all stats"
    ON public.user_stats FOR SELECT
    USING (true);

CREATE POLICY "Users can update their own stats"
    ON public.user_stats FOR UPDATE
    USING (auth.uid() = user_id);

-- Roasters policies
CREATE POLICY "Anyone can view roasters"
    ON public.roasters FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can create roasters"
    ON public.roasters FOR INSERT
    WITH CHECK (
        auth.role() = 'authenticated' AND
        (created_by IS NULL OR created_by = auth.uid())
    );

CREATE POLICY "Users can update their own roasters"
    ON public.roasters FOR UPDATE
    USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own roasters"
    ON public.roasters FOR DELETE
    USING (auth.uid() = created_by);

-- Beans policies
CREATE POLICY "Anyone can view beans"
    ON public.beans FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can create beans"
    ON public.beans FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own beans"
    ON public.beans FOR UPDATE
    USING (auth.uid() = created_by);

-- Reviews policies
CREATE POLICY "Anyone can view reviews"
    ON public.reviews FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can create reviews"
    ON public.reviews FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
    ON public.reviews FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
    ON public.reviews FOR DELETE
    USING (auth.uid() = user_id);

-- Visited roasters policies
CREATE POLICY "Users can view their own visited roasters"
    ON public.visited_roasters FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can mark roasters as visited"
    ON public.visited_roasters FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their visited roasters"
    ON public.visited_roasters FOR DELETE
    USING (auth.uid() = user_id);