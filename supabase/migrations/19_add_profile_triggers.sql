-- Create function to calculate coffee expertise score
CREATE OR REPLACE FUNCTION calculate_coffee_expertise_score()
RETURNS TRIGGER AS $$
BEGIN
  NEW.coffee_expertise_score := (
    COALESCE(NEW.beans_tried, 0) * 10 +
    COALESCE(NEW.roasters_visited, 0) * 15 +
    COALESCE(NEW.total_reviews, 0) * 5 +
    COALESCE(NEW.unique_origins, 0) * 20 +
    COALESCE(NEW.brewing_methods_used, 0) * 25
  );
  
  -- Update level based on expertise score
  NEW.level := GREATEST(1, FLOOR(SQRT(NEW.coffee_expertise_score / 100)) + 1)::INTEGER;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating coffee expertise score
CREATE TRIGGER update_coffee_expertise_score
  BEFORE UPDATE ON public.user_stats
  FOR EACH ROW
  EXECUTE FUNCTION calculate_coffee_expertise_score();

-- Create function to handle avatar updates
CREATE OR REPLACE FUNCTION handle_avatar_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete old avatar if it exists
  IF OLD.avatar_url IS NOT NULL AND OLD.avatar_url != NEW.avatar_url THEN
    -- Extract file name from URL
    DECLARE
      old_file_name TEXT;
    BEGIN
      old_file_name := substring(OLD.avatar_url from '/avatars/([^/]+)$');
      IF old_file_name IS NOT NULL THEN
        PERFORM storage.delete('avatars', old_file_name);
      END IF;
    EXCEPTION WHEN OTHERS THEN
      -- Log error but continue
      RAISE LOG 'Error deleting old avatar: %', SQLERRM;
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for handling avatar updates
CREATE TRIGGER on_avatar_update
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  WHEN (OLD.avatar_url IS DISTINCT FROM NEW.avatar_url)
  EXECUTE FUNCTION handle_avatar_update();