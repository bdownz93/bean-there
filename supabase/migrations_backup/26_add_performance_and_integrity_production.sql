-- Wrap everything in a transaction
BEGIN;

-- Add function for updating timestamps if it doesn't exist
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add indexes for better query performance
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

-- Validate existing data before adding constraints
DO $$ 
BEGIN 
    -- Check beans ratings
    IF EXISTS (
        SELECT 1 FROM public.beans 
        WHERE rating < 0 OR rating > 5
    ) THEN
        RAISE EXCEPTION 'Invalid ratings found in beans table. Please fix before adding constraint.';
    END IF;

    -- Check roasters ratings
    IF EXISTS (
        SELECT 1 FROM public.roasters 
        WHERE rating < 0 OR rating > 5
    ) THEN
        RAISE EXCEPTION 'Invalid ratings found in roasters table. Please fix before adding constraint.';
    END IF;

    -- Check reviews ratings
    IF EXISTS (
        SELECT 1 FROM public.reviews 
        WHERE rating < 1 OR rating > 5
    ) THEN
        RAISE EXCEPTION 'Invalid ratings found in reviews table. Please fix before adding constraint.';
    END IF;
END $$;

-- Add constraints for data integrity
DO $$ 
BEGIN 
    -- Add rating constraints if they don't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'valid_beans_rating'
    ) THEN
        ALTER TABLE public.beans
        ADD CONSTRAINT valid_beans_rating 
        CHECK (rating >= 0 AND rating <= 5);
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'valid_roasters_rating'
    ) THEN
        ALTER TABLE public.roasters
        ADD CONSTRAINT valid_roasters_rating 
        CHECK (rating >= 0 AND rating <= 5);
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'valid_reviews_rating'
    ) THEN
        ALTER TABLE public.reviews
        ADD CONSTRAINT valid_reviews_rating 
        CHECK (rating >= 1 AND rating <= 5);
    END IF;
END $$;

-- Add triggers for updating timestamps
DO $$ 
BEGIN 
    -- Drop existing triggers if they exist
    DROP TRIGGER IF EXISTS update_beans_timestamp ON public.beans;
    DROP TRIGGER IF EXISTS update_roasters_timestamp ON public.roasters;
    DROP TRIGGER IF EXISTS update_reviews_timestamp ON public.reviews;
    
    -- Create new triggers
    CREATE TRIGGER update_beans_timestamp
    BEFORE UPDATE ON public.beans
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

    CREATE TRIGGER update_roasters_timestamp
    BEFORE UPDATE ON public.roasters
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

    CREATE TRIGGER update_reviews_timestamp
    BEFORE UPDATE ON public.reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();
END $$;

-- Create materialized view for featured beans
DO $$ 
BEGIN
    -- Drop the view if it exists
    DROP MATERIALIZED VIEW IF EXISTS featured_beans;
    
    -- Create the new view
    CREATE MATERIALIZED VIEW featured_beans AS
    SELECT 
        b.*,
        r.name as roaster_name,
        r.slug as roaster_slug,
        COUNT(rv.id) as review_count,
        COALESCE(AVG(rv.rating), 0) as average_rating
    FROM public.beans b
    LEFT JOIN public.roasters r ON b.roaster_id = r.id
    LEFT JOIN public.reviews rv ON b.id = rv.bean_id
    GROUP BY b.id, r.id
    ORDER BY average_rating DESC, review_count DESC
    LIMIT 10;

    -- Create index on materialized view
    CREATE UNIQUE INDEX IF NOT EXISTS featured_beans_id_idx ON featured_beans (id);
END $$;

-- Create function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_featured_beans()
RETURNS TRIGGER AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY featured_beans;
    RETURN NULL;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error but don't fail the transaction
        RAISE WARNING 'Error refreshing featured_beans view: %', SQLERRM;
        RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to refresh materialized view
DO $$ 
BEGIN 
    DROP TRIGGER IF EXISTS refresh_featured_beans_on_review ON public.reviews;
    DROP TRIGGER IF EXISTS refresh_featured_beans_on_bean ON public.beans;
    
    CREATE TRIGGER refresh_featured_beans_on_review
    AFTER INSERT OR UPDATE OR DELETE ON public.reviews
    FOR EACH STATEMENT
    EXECUTE FUNCTION refresh_featured_beans();

    CREATE TRIGGER refresh_featured_beans_on_bean
    AFTER INSERT OR UPDATE OR DELETE ON public.beans
    FOR EACH STATEMENT
    EXECUTE FUNCTION refresh_featured_beans();
END $$;

COMMIT;
