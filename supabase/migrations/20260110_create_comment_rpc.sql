-- Create RPC function to insert community comments
-- This bypasses any potential interceptors

CREATE OR REPLACE FUNCTION create_community_comment(
  p_post_id UUID,
  p_author_id UUID,
  p_content TEXT,
  p_parent_id UUID DEFAULT NULL,
  p_reply_to_username TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_comment community_post_comments%ROWTYPE;
  v_author JSON;
BEGIN
  -- Insert the comment
  INSERT INTO community_post_comments (post_id, author_id, content, parent_id, reply_to_username)
  VALUES (p_post_id, p_author_id, p_content, p_parent_id, p_reply_to_username)
  RETURNING * INTO v_comment;

  -- Get author info
  SELECT json_build_object(
    'id', u.id,
    'username', u.username,
    'display_name', u.display_name,
    'avatar_url', u.avatar_url,
    'level', u.level
  ) INTO v_author
  FROM users u WHERE u.id = p_author_id;

  -- Increment comments_count on post
  UPDATE community_posts
  SET comments_count = comments_count + 1
  WHERE id = p_post_id;

  -- If reply, increment replies_count on parent
  IF p_parent_id IS NOT NULL THEN
    UPDATE community_post_comments
    SET replies_count = COALESCE(replies_count, 0) + 1
    WHERE id = p_parent_id;
  END IF;

  -- Return the comment with author
  RETURN json_build_object(
    'id', v_comment.id,
    'post_id', v_comment.post_id,
    'author_id', v_comment.author_id,
    'content', v_comment.content,
    'created_at', v_comment.created_at,
    'parent_id', v_comment.parent_id,
    'reply_to_username', v_comment.reply_to_username,
    'replies_count', COALESCE(v_comment.replies_count, 0),
    'author', v_author
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
