-- Create a function to increment views count that bypasses RLS
CREATE OR REPLACE FUNCTION public.increment_topic_views(topic_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE forum_topics
  SET views_count = views_count + 1
  WHERE id = topic_id;
END;
$$;