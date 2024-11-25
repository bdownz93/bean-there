-- Add coordinates column to roasters table
ALTER TABLE roasters ADD COLUMN IF NOT EXISTS coordinates JSONB;

-- Drop and recreate the policy
DROP POLICY IF EXISTS "Roasters are viewable by everyone" ON roasters;
CREATE POLICY "Roasters are viewable by everyone" ON roasters
    FOR SELECT USING (true);

-- Grant necessary permissions
GRANT ALL ON TABLE roasters TO postgres, anon, authenticated, service_role;
