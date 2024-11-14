-- Create review-photos storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('review-photos', 'review-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;

-- Create simplified policies
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'review-photos' );

CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT 
WITH CHECK (
    bucket_id = 'review-photos' 
    AND auth.role() = 'authenticated'
);