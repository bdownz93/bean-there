-- Add indexes for better query performance (this runs outside transaction)
DO $$ 
BEGIN 
    -- Beans indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_beans_slug') THEN
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_beans_slug ON public.beans(slug);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_beans_roaster_id') THEN
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_beans_roaster_id ON public.beans(roaster_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_beans_rating') THEN
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_beans_rating ON public.beans(rating);
    END IF;

    -- Roasters indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_roasters_slug') THEN
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_roasters_slug ON public.roasters(slug);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_roasters_rating') THEN
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_roasters_rating ON public.roasters(rating);
    END IF;

    -- Reviews indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_reviews_user_id') THEN
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_reviews_bean_id') THEN
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_bean_id ON public.reviews(bean_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_reviews_rating') THEN
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_rating ON public.reviews(rating);
    END IF;
END $$;
