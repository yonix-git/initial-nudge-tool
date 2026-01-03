-- Create forums table (categories)
CREATE TABLE public.forums (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT DEFAULT 'MessageSquare',
  topics_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create forum topics table
CREATE TABLE public.forum_topics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  forum_id UUID NOT NULL REFERENCES public.forums(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  views_count INTEGER NOT NULL DEFAULT 0,
  replies_count INTEGER NOT NULL DEFAULT 0,
  likes_count INTEGER NOT NULL DEFAULT 0,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  is_solved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create forum replies table
CREATE TABLE public.forum_replies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID NOT NULL REFERENCES public.forum_topics(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  likes_count INTEGER NOT NULL DEFAULT 0,
  is_answer BOOLEAN NOT NULL DEFAULT false,
  parent_reply_id UUID REFERENCES public.forum_replies(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create forum topic likes table
CREATE TABLE public.forum_topic_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID NOT NULL REFERENCES public.forum_topics(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(topic_id, user_id)
);

-- Create forum reply likes table
CREATE TABLE public.forum_reply_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reply_id UUID NOT NULL REFERENCES public.forum_replies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(reply_id, user_id)
);

-- Enable RLS
ALTER TABLE public.forums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_topic_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_reply_likes ENABLE ROW LEVEL SECURITY;

-- Forums policies (public read, admin write)
CREATE POLICY "Anyone can view forums" ON public.forums FOR SELECT USING (true);
CREATE POLICY "Admins can manage forums" ON public.forums FOR ALL USING (is_admin());

-- Forum topics policies
CREATE POLICY "Anyone can view topics" ON public.forum_topics FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create topics" ON public.forum_topics FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own topics" ON public.forum_topics FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own topics" ON public.forum_topics FOR DELETE USING (auth.uid() = user_id);

-- Forum replies policies
CREATE POLICY "Anyone can view replies" ON public.forum_replies FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create replies" ON public.forum_replies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own replies" ON public.forum_replies FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own replies" ON public.forum_replies FOR DELETE USING (auth.uid() = user_id);

-- Topic likes policies
CREATE POLICY "Anyone can view topic likes" ON public.forum_topic_likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can like topics" ON public.forum_topic_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove their own likes" ON public.forum_topic_likes FOR DELETE USING (auth.uid() = user_id);

-- Reply likes policies
CREATE POLICY "Anyone can view reply likes" ON public.forum_reply_likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can like replies" ON public.forum_reply_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove their own likes" ON public.forum_reply_likes FOR DELETE USING (auth.uid() = user_id);

-- Function to update topic replies count
CREATE OR REPLACE FUNCTION public.update_topic_replies_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.forum_topics SET replies_count = replies_count + 1 WHERE id = NEW.topic_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.forum_topics SET replies_count = GREATEST(0, replies_count - 1) WHERE id = OLD.topic_id;
  END IF;
  RETURN NULL;
END;
$$;

-- Function to update topic likes count
CREATE OR REPLACE FUNCTION public.update_topic_likes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.forum_topics SET likes_count = likes_count + 1 WHERE id = NEW.topic_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.forum_topics SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.topic_id;
  END IF;
  RETURN NULL;
END;
$$;

-- Function to update reply likes count
CREATE OR REPLACE FUNCTION public.update_reply_likes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.forum_replies SET likes_count = likes_count + 1 WHERE id = NEW.reply_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.forum_replies SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.reply_id;
  END IF;
  RETURN NULL;
END;
$$;

-- Function to update forum topics count
CREATE OR REPLACE FUNCTION public.update_forum_topics_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.forums SET topics_count = topics_count + 1 WHERE id = NEW.forum_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.forums SET topics_count = GREATEST(0, topics_count - 1) WHERE id = OLD.forum_id;
  END IF;
  RETURN NULL;
END;
$$;

-- Create triggers
CREATE TRIGGER on_reply_created
  AFTER INSERT OR DELETE ON public.forum_replies
  FOR EACH ROW EXECUTE FUNCTION public.update_topic_replies_count();

CREATE TRIGGER on_topic_liked
  AFTER INSERT OR DELETE ON public.forum_topic_likes
  FOR EACH ROW EXECUTE FUNCTION public.update_topic_likes_count();

CREATE TRIGGER on_reply_liked
  AFTER INSERT OR DELETE ON public.forum_reply_likes
  FOR EACH ROW EXECUTE FUNCTION public.update_reply_likes_count();

CREATE TRIGGER on_topic_created
  AFTER INSERT OR DELETE ON public.forum_topics
  FOR EACH ROW EXECUTE FUNCTION public.update_forum_topics_count();

-- Insert default forum categories
INSERT INTO public.forums (name, description, icon) VALUES
  ('שאלות ותשובות', 'שאלות טכניות ופתרונות לבעיות ברכב', 'HelpCircle'),
  ('טיפים והמלצות', 'טיפים לתחזוקה, שדרוגים והמלצות', 'Lightbulb'),
  ('דיונים כלליים', 'שיחות כלליות על רכבים ותחבורה', 'MessageSquare'),
  ('קניה ומכירה', 'עצות לקניה ומכירה של רכבים', 'ShoppingCart');