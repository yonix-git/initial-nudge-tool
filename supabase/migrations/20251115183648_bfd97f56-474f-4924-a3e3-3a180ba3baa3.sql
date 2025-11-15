-- Add creator_id columns to track ownership
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS creator_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS creator_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS creator_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create junction tables for proper tracking
CREATE TABLE IF NOT EXISTS public.event_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  joined_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE(event_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.event_interested (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE(event_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  joined_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE(group_id, user_id)
);

-- Enable RLS on junction tables
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_interested ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- RLS policies for event_participants
CREATE POLICY "Anyone can view event participants"
ON public.event_participants FOR SELECT USING (true);

CREATE POLICY "Authenticated users can join events"
ON public.event_participants FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave events"
ON public.event_participants FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- RLS policies for event_interested
CREATE POLICY "Anyone can view interested users"
ON public.event_interested FOR SELECT USING (true);

CREATE POLICY "Authenticated users can mark interest"
ON public.event_interested FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their interest"
ON public.event_interested FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- RLS policies for group_members
CREATE POLICY "Anyone can view group members"
ON public.group_members FOR SELECT USING (true);

CREATE POLICY "Authenticated users can join groups"
ON public.group_members FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave groups"
ON public.group_members FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Update groups RLS policies to restrict modifications to creators
DROP POLICY IF EXISTS "Authenticated users can update groups" ON public.groups;
CREATE POLICY "Creators can update their groups"
ON public.groups FOR UPDATE
TO authenticated
USING (auth.uid() = creator_id);

DROP POLICY IF EXISTS "Authenticated users can create groups" ON public.groups;
CREATE POLICY "Authenticated users can create groups"
ON public.groups FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can delete their groups"
ON public.groups FOR DELETE
TO authenticated
USING (auth.uid() = creator_id);

-- Update events RLS policies to restrict modifications to creators
DROP POLICY IF EXISTS "Authenticated users can update events" ON public.events;
CREATE POLICY "Creators can update their events"
ON public.events FOR UPDATE
TO authenticated
USING (auth.uid() = creator_id);

DROP POLICY IF EXISTS "Authenticated users can create events" ON public.events;
CREATE POLICY "Authenticated users can create events"
ON public.events FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can delete their events"
ON public.events FOR DELETE
TO authenticated
USING (auth.uid() = creator_id);

-- Update services RLS policies to restrict modifications to creators
DROP POLICY IF EXISTS "Authenticated users can update services" ON public.services;
CREATE POLICY "Creators can update their services"
ON public.services FOR UPDATE
TO authenticated
USING (auth.uid() = creator_id);

DROP POLICY IF EXISTS "Authenticated users can create services" ON public.services;
CREATE POLICY "Authenticated users can create services"
ON public.services FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can delete their services"
ON public.services FOR DELETE
TO authenticated
USING (auth.uid() = creator_id);

-- Create triggers to automatically sync counts
CREATE OR REPLACE FUNCTION public.update_event_participants_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.events
    SET participants = (
      SELECT COUNT(*) FROM public.event_participants WHERE event_id = NEW.event_id
    )
    WHERE id = NEW.event_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.events
    SET participants = (
      SELECT COUNT(*) FROM public.event_participants WHERE event_id = OLD.event_id
    )
    WHERE id = OLD.event_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_event_interested_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.events
    SET interested = (
      SELECT COUNT(*) FROM public.event_interested WHERE event_id = NEW.event_id
    )
    WHERE id = NEW.event_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.events
    SET interested = (
      SELECT COUNT(*) FROM public.event_interested WHERE event_id = OLD.event_id
    )
    WHERE id = OLD.event_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_group_members_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.groups
    SET members = (
      SELECT COUNT(*) FROM public.group_members WHERE group_id = NEW.group_id
    )
    WHERE id = NEW.group_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.groups
    SET members = (
      SELECT COUNT(*) FROM public.group_members WHERE group_id = OLD.group_id
    )
    WHERE id = OLD.group_id;
  END IF;
  RETURN NULL;
END;
$$;

-- Prevent joining events that are full
CREATE OR REPLACE FUNCTION public.check_event_capacity()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  current_participants integer;
  max_capacity integer;
BEGIN
  SELECT participants, max_participants INTO current_participants, max_capacity
  FROM public.events WHERE id = NEW.event_id;
  
  IF current_participants >= max_capacity THEN
    RAISE EXCEPTION 'Event is already full';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create triggers
DROP TRIGGER IF EXISTS on_event_participant_change ON public.event_participants;
CREATE TRIGGER on_event_participant_change
AFTER INSERT OR DELETE ON public.event_participants
FOR EACH ROW EXECUTE FUNCTION public.update_event_participants_count();

DROP TRIGGER IF EXISTS on_event_interested_change ON public.event_interested;
CREATE TRIGGER on_event_interested_change
AFTER INSERT OR DELETE ON public.event_interested
FOR EACH ROW EXECUTE FUNCTION public.update_event_interested_count();

DROP TRIGGER IF EXISTS on_group_member_change ON public.group_members;
CREATE TRIGGER on_group_member_change
AFTER INSERT OR DELETE ON public.group_members
FOR EACH ROW EXECUTE FUNCTION public.update_group_members_count();

DROP TRIGGER IF EXISTS check_event_capacity_trigger ON public.event_participants;
CREATE TRIGGER check_event_capacity_trigger
BEFORE INSERT ON public.event_participants
FOR EACH ROW EXECUTE FUNCTION public.check_event_capacity();