-- Storage buckets
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'review-photos') THEN
        INSERT INTO storage.buckets (id, name, public) VALUES ('review-photos', 'review-photos', true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'roaster-logos') THEN
        INSERT INTO storage.buckets (id, name, public) VALUES ('roaster-logos', 'roaster-logos', true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'bean-photos') THEN
        INSERT INTO storage.buckets (id, name, public) VALUES ('bean-photos', 'bean-photos', true);
    END IF;
END $$;

-- Storage policies
DO $$ 
BEGIN
    BEGIN
        CREATE POLICY "Review photos are viewable by everyone" ON storage.objects
            FOR SELECT USING (bucket_id = 'review-photos');
    EXCEPTION 
        WHEN duplicate_object THEN NULL;
    END;

    BEGIN
        CREATE POLICY "Users can upload review photos" ON storage.objects
            FOR INSERT WITH CHECK (
                bucket_id = 'review-photos' 
                AND auth.uid() IS NOT NULL 
                AND (storage.foldername(name))[1] = auth.uid()::text
            );
    EXCEPTION 
        WHEN duplicate_object THEN NULL;
    END;

    BEGIN
        CREATE POLICY "Roaster logos are viewable by everyone" ON storage.objects
            FOR SELECT USING (bucket_id = 'roaster-logos');
    EXCEPTION 
        WHEN duplicate_object THEN NULL;
    END;

    BEGIN
        CREATE POLICY "Users can upload roaster logos" ON storage.objects
            FOR INSERT WITH CHECK (
                bucket_id = 'roaster-logos' 
                AND auth.uid() IS NOT NULL 
                AND (storage.foldername(name))[1] = auth.uid()::text
            );
    EXCEPTION 
        WHEN duplicate_object THEN NULL;
    END;

    BEGIN
        CREATE POLICY "Bean photos are viewable by everyone" ON storage.objects
            FOR SELECT USING (bucket_id = 'bean-photos');
    EXCEPTION 
        WHEN duplicate_object THEN NULL;
    END;

    BEGIN
        CREATE POLICY "Users can upload bean photos" ON storage.objects
            FOR INSERT WITH CHECK (
                bucket_id = 'bean-photos' 
                AND auth.uid() IS NOT NULL 
                AND (storage.foldername(name))[1] = auth.uid()::text
            );
    EXCEPTION 
        WHEN duplicate_object THEN NULL;
    END;
END $$;
