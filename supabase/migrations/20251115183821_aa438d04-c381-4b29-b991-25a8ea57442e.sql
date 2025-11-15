-- Fix function search paths to be immutable
CREATE OR REPLACE FUNCTION public.check_event_capacity()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
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