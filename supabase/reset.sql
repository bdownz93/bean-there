-- Drop all tables and related objects
DROP TRIGGER IF EXISTS refresh_bean_stats_on_review ON reviews;
DROP FUNCTION IF EXISTS refresh_bean_stats();
DROP MATERIALIZED VIEW IF EXISTS bean_stats;
DROP VIEW IF EXISTS featured_beans;
DROP TABLE IF EXISTS review_likes CASCADE;
DROP TABLE IF EXISTS review_comments CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS beans CASCADE;
DROP TABLE IF EXISTS roasters CASCADE;
DROP TABLE IF EXISTS user_stats CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Re-run migrations
\i migrations/20240320000000_init.sql
\i migrations/20240320000001_storage.sql
\i migrations/20240320000002_views.sql
\i migrations/20240320000003_fix_permissions.sql
\i migrations/20240320000004_fix_user_creation.sql

-- Re-run seed data
\i seed.sql
