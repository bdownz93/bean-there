-- Add image fields to roasters and beans tables
ALTER TABLE roasters 
    ADD COLUMN IF NOT EXISTS hero_image_url TEXT;

ALTER TABLE beans
    ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Update permissions
GRANT ALL ON TABLE roasters TO postgres, anon, authenticated, service_role;
GRANT ALL ON TABLE beans TO postgres, anon, authenticated, service_role;
