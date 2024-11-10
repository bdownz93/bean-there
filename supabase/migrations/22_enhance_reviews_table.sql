-- Add new columns to reviews table
ALTER TABLE public.reviews
ADD COLUMN IF NOT EXISTS aroma INTEGER,
ADD COLUMN IF NOT EXISTS body INTEGER,
ADD COLUMN IF NOT EXISTS acidity INTEGER,
ADD COLUMN IF NOT EXISTS sweetness INTEGER,
ADD COLUMN IF NOT EXISTS aftertaste INTEGER;

-- Add check constraints after columns are created
ALTER TABLE public.reviews
ADD CONSTRAINT check_aroma CHECK (aroma >= 0 AND aroma <= 100),
ADD CONSTRAINT check_body CHECK (body >= 0 AND body <= 100),
ADD CONSTRAINT check_acidity CHECK (acidity >= 0 AND acidity <= 100),
ADD CONSTRAINT check_sweetness CHECK (sweetness >= 0 AND sweetness <= 100),
ADD CONSTRAINT check_aftertaste CHECK (aftertaste >= 0 AND aftertaste <= 100);