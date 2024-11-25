-- Create policy to allow system to create users
DROP POLICY IF EXISTS "System can create users" ON users;
CREATE POLICY "System can create users" ON users
    FOR INSERT WITH CHECK (true);

-- Create policy to allow users to update their own records
DROP POLICY IF EXISTS "Users can update own record" ON users;
CREATE POLICY "Users can update own record" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Create policy to allow users to delete their own records
DROP POLICY IF EXISTS "Users can delete own record" ON users;
CREATE POLICY "Users can delete own record" ON users
    FOR DELETE USING (auth.uid() = id);
