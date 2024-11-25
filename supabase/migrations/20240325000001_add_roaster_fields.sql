-- Add additional columns to roasters table
ALTER TABLE roasters 
    ADD COLUMN IF NOT EXISTS phone TEXT,
    ADD COLUMN IF NOT EXISTS email TEXT,
    ADD COLUMN IF NOT EXISTS instagram TEXT,
    ADD COLUMN IF NOT EXISTS hours JSONB,
    ADD COLUMN IF NOT EXISTS specialties TEXT[],
    ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2);

-- Update permissions
GRANT ALL ON TABLE roasters TO postgres, anon, authenticated, service_role;
