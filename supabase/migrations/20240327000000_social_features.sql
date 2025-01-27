-- Enable RLS
ALTER TABLE IF EXISTS comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS saved_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_badges ENABLE ROW LEVEL SECURITY;

-- Comments and Replies
CREATE TABLE IF NOT EXISTS comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
    roaster_id UUID REFERENCES roasters(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    -- Ensure comment is attached to exactly one parent type
    CONSTRAINT one_parent_type CHECK (
        (CASE WHEN review_id IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN roaster_id IS NOT NULL THEN 1 ELSE 0 END) = 1
    )
);

-- Comment Likes
CREATE TABLE IF NOT EXISTS comment_likes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    comment_id UUID REFERENCES comments(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, comment_id)
);

-- User Follows
CREATE TABLE IF NOT EXISTS follows (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    follower_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    following_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(follower_id, following_id),
    -- Prevent self-following
    CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL,
    content TEXT NOT NULL,
    link TEXT,
    read BOOLEAN DEFAULT false,
    actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    reference_id UUID, -- Generic reference to the relevant item (comment, review, etc.)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Saved Items
CREATE TABLE IF NOT EXISTS saved_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    bean_id UUID REFERENCES beans(id) ON DELETE CASCADE,
    roaster_id UUID REFERENCES roasters(id) ON DELETE CASCADE,
    review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
    collection_name TEXT NOT NULL DEFAULT 'Favorites',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    -- Ensure item is of exactly one type
    CONSTRAINT one_item_type CHECK (
        (CASE WHEN bean_id IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN roaster_id IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN review_id IS NOT NULL THEN 1 ELSE 0 END) = 1
    )
);

-- User Badges
CREATE TABLE IF NOT EXISTS user_badges (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    badge_type TEXT NOT NULL,
    awarded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, badge_type)
);

-- Add RLS Policies

-- Comments
CREATE POLICY "Comments are viewable by everyone" ON comments
    FOR SELECT USING (true);

CREATE POLICY "Users can create comments" ON comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments" ON comments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" ON comments
    FOR DELETE USING (auth.uid() = user_id);

-- Comment Likes
CREATE POLICY "Comment likes are viewable by everyone" ON comment_likes
    FOR SELECT USING (true);

CREATE POLICY "Users can create comment likes" ON comment_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comment likes" ON comment_likes
    FOR DELETE USING (auth.uid() = user_id);

-- Follows
CREATE POLICY "Follows are viewable by everyone" ON follows
    FOR SELECT USING (true);

CREATE POLICY "Users can create follows" ON follows
    FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete own follows" ON follows
    FOR DELETE USING (auth.uid() = follower_id);

-- Notifications
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON notifications
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications" ON notifications
    FOR DELETE USING (auth.uid() = user_id);

-- Saved Items
CREATE POLICY "Users can view own saved items" ON saved_items
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create saved items" ON saved_items
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved items" ON saved_items
    FOR DELETE USING (auth.uid() = user_id);

-- User Badges
CREATE POLICY "User badges are viewable by everyone" ON user_badges
    FOR SELECT USING (true);

CREATE POLICY "System can create badges" ON user_badges
    FOR INSERT WITH CHECK (true);

-- Create functions for notifications

CREATE OR REPLACE FUNCTION notify_on_comment() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.review_id IS NOT NULL THEN
        -- Get the review author
        INSERT INTO notifications (user_id, type, content, actor_id, reference_id)
        SELECT r.user_id, 
               'comment',
               'commented on your review',
               NEW.user_id,
               NEW.id
        FROM reviews r
        WHERE r.id = NEW.review_id AND r.user_id != NEW.user_id;
    ELSIF NEW.roaster_id IS NOT NULL THEN
        -- Notify roaster creator if exists
        INSERT INTO notifications (user_id, type, content, actor_id, reference_id)
        SELECT created_by,
               'comment',
               'commented on your roaster',
               NEW.user_id,
               NEW.id
        FROM roasters
        WHERE id = NEW.roaster_id AND created_by IS NOT NULL AND created_by != NEW.user_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_comment_created
    AFTER INSERT ON comments
    FOR EACH ROW
    EXECUTE FUNCTION notify_on_comment();

CREATE OR REPLACE FUNCTION notify_on_follow() RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO notifications (user_id, type, content, actor_id, reference_id)
    VALUES (NEW.following_id, 'follow', 'started following you', NEW.follower_id, NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_follow_created
    AFTER INSERT ON follows
    FOR EACH ROW
    EXECUTE FUNCTION notify_on_follow();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_comments_review_id ON comments(review_id);
CREATE INDEX IF NOT EXISTS idx_comments_roaster_id ON comments(roaster_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id ON comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_items_user_id ON saved_items(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
