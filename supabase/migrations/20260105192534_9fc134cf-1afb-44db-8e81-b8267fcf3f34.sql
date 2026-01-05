-- Create table to track unique topic views per user
CREATE TABLE public.forum_topic_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID NOT NULL REFERENCES public.forum_topics(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(topic_id, user_id)
);

-- Enable RLS
ALTER TABLE public.forum_topic_views ENABLE ROW LEVEL SECURITY;

-- Users can insert their own view records
CREATE POLICY "Users can insert their own views"
ON public.forum_topic_views
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can view their own view records
CREATE POLICY "Users can view their own views"
ON public.forum_topic_views
FOR SELECT
USING (auth.uid() = user_id);

-- Create updated function that only increments if user hasn't viewed before
CREATE OR REPLACE FUNCTION public.increment_topic_views(topic_id uuid, viewer_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  view_exists boolean;
BEGIN
  -- Check if this user has already viewed this topic
  SELECT EXISTS (
    SELECT 1 FROM forum_topic_views
    WHERE forum_topic_views.topic_id = increment_topic_views.topic_id
    AND forum_topic_views.user_id = viewer_id
  ) INTO view_exists;
  
  -- If not viewed before, insert view record and increment count
  IF NOT view_exists THEN
    INSERT INTO forum_topic_views (topic_id, user_id)
    VALUES (increment_topic_views.topic_id, viewer_id);
    
    UPDATE forum_topics
    SET views_count = views_count + 1
    WHERE id = increment_topic_views.topic_id;
  END IF;
END;
$$;