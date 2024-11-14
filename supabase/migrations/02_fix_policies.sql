-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view roasters" ON public.roasters;
DROP POLICY IF EXISTS "Anyone can view beans" ON public.beans;
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;

-- Create new policies that allow public access
CREATE POLICY "Enable read access for all users" ON public.roasters
    FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON public.beans
    FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON public.reviews
    FOR SELECT USING (true);

-- Grant access to the materialized view
GRANT SELECT ON featured_beans TO anon;
GRANT SELECT ON featured_beans TO authenticated;

-- Grant public access to necessary tables
GRANT SELECT ON public.roasters TO anon;
GRANT SELECT ON public.roasters TO authenticated;

GRANT SELECT ON public.beans TO anon;
GRANT SELECT ON public.beans TO authenticated;

GRANT SELECT ON public.reviews TO anon;
GRANT SELECT ON public.reviews TO authenticated;

-- Refresh the materialized view
REFRESH MATERIALIZED VIEW featured_beans;
