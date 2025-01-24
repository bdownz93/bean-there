-- Drop existing trigger and function
DROP TRIGGER IF EXISTS refresh_bean_stats_on_review ON reviews;
DROP FUNCTION IF EXISTS refresh_bean_stats();

-- Recreate the materialized view with proper permissions
DROP MATERIALIZED VIEW IF EXISTS bean_stats;
CREATE MATERIALIZED VIEW bean_stats AS
SELECT 
    b.id,
    COALESCE(AVG(rv.rating)::NUMERIC(10,2), 0) as average_rating,
    COUNT(rv.id) as review_count
FROM beans b
LEFT JOIN reviews rv ON b.id = rv.bean_id
GROUP BY b.id;

CREATE INDEX bean_stats_id_idx ON bean_stats(id);

-- Grant permissions
GRANT SELECT ON bean_stats TO anon, authenticated;

-- Recreate the refresh function with proper permissions
CREATE OR REPLACE FUNCTION refresh_bean_stats()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY bean_stats;
    RETURN NULL;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER refresh_bean_stats_on_review
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH STATEMENT
    EXECUTE FUNCTION refresh_bean_stats();
