-- Create trigger for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Create trigger for new roasters
DROP TRIGGER IF EXISTS on_roaster_created ON public.roasters;
CREATE TRIGGER on_roaster_created
    BEFORE INSERT ON public.roasters
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_roaster();

-- Create trigger for updated_at columns
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roasters_updated_at
    BEFORE UPDATE ON public.roasters
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_beans_updated_at
    BEFORE UPDATE ON public.beans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
    BEFORE UPDATE ON public.reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create trigger function for stats updates
CREATE OR REPLACE FUNCTION public.trigger_update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM public.update_user_stats(
        CASE 
            WHEN TG_OP = 'DELETE' THEN OLD.user_id
            ELSE NEW.user_id
        END
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add triggers for stats updates
CREATE TRIGGER update_stats_on_review
    AFTER INSERT OR UPDATE OR DELETE ON public.reviews
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_update_user_stats();

CREATE TRIGGER update_stats_on_visited
    AFTER INSERT OR DELETE ON public.visited_roasters
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_update_user_stats();

CREATE TRIGGER update_stats_on_roaster
    AFTER INSERT ON public.roasters
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_update_user_stats();