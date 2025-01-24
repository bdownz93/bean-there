-- Create storage bucket for roaster logos if it doesn't exist
INSERT INTO storage.buckets (id, name)
VALUES ('roaster-logos', 'roaster-logos')
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Roaster logos are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload roaster logos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own roaster logos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own roaster logos" ON storage.objects;

-- Create policies
CREATE POLICY "Roaster logos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'roaster-logos');

CREATE POLICY "Users can upload roaster logos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'roaster-logos'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own roaster logos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'roaster-logos'
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'roaster-logos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own roaster logos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'roaster-logos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
