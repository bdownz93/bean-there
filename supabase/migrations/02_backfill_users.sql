-- Backfill existing users
INSERT INTO public.users (id, username, name, avatar_url, created_at, updated_at)
SELECT 
  id,
  COALESCE(raw_user_meta_data->>'username', SPLIT_PART(email, '@', 1)),
  COALESCE(raw_user_meta_data->>'name', email),
  'https://api.dicebear.com/7.x/avataaars/svg?seed=' || id,
  created_at,
  created_at
FROM auth.users
ON CONFLICT (id) DO UPDATE
SET 
  username = EXCLUDED.username,
  name = EXCLUDED.name,
  avatar_url = EXCLUDED.avatar_url;