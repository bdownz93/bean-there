-- Create views
CREATE OR REPLACE VIEW featured_beans AS
SELECT 
    b.*,
    r.name AS roaster_name,
    r.slug AS roaster_slug,
    COALESCE(AVG(rv.rating)::NUMERIC(10,2), 0) as average_rating,
    COUNT(rv.id) as review_count
FROM beans b
LEFT JOIN roasters r ON b.roaster_id = r.id
LEFT JOIN reviews rv ON b.id = rv.bean_id
WHERE b.is_featured = true
GROUP BY b.id, r.id;

CREATE MATERIALIZED VIEW IF NOT EXISTS bean_stats AS
SELECT 
    b.id,
    COALESCE(AVG(rv.rating)::NUMERIC(10,2), 0) as average_rating,
    COUNT(rv.id) as review_count
FROM beans b
LEFT JOIN reviews rv ON b.id = rv.bean_id
GROUP BY b.id;

CREATE INDEX IF NOT EXISTS bean_stats_id_idx ON bean_stats(id);

-- Refresh function for bean_stats
CREATE OR REPLACE FUNCTION refresh_bean_stats()
RETURNS trigger AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY bean_stats;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to refresh bean_stats
DROP TRIGGER IF EXISTS refresh_bean_stats_on_review ON reviews;
CREATE TRIGGER refresh_bean_stats_on_review
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH STATEMENT
    EXECUTE FUNCTION refresh_bean_stats();
