-- Allow recipients to mark direct messages as read without allowing them to edit message content

-- 1) Add RLS policy for recipients to update messages in their conversations
CREATE POLICY "Recipients can mark messages read"
ON public.direct_messages
FOR UPDATE
USING (
  auth.uid() <> sender_id
  AND EXISTS (
    SELECT 1
    FROM public.conversations c
    WHERE c.id = direct_messages.conversation_id
      AND (c.user1_id = auth.uid() OR c.user2_id = auth.uid())
  )
)
WITH CHECK (
  auth.uid() <> sender_id
  AND EXISTS (
    SELECT 1
    FROM public.conversations c
    WHERE c.id = direct_messages.conversation_id
      AND (c.user1_id = auth.uid() OR c.user2_id = auth.uid())
  )
);

-- 2) Trigger to ensure recipients can ONLY change is_read to true
CREATE OR REPLACE FUNCTION public.enforce_direct_message_recipient_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Sender can update their own message (existing policy)
  IF auth.uid() = OLD.sender_id THEN
    RETURN NEW;
  END IF;

  -- Non-senders may only mark as read (and only to true)
  IF NEW.is_read IS DISTINCT FROM TRUE THEN
    RAISE EXCEPTION 'Only allowed update is setting is_read=true';
  END IF;

  IF NEW.content IS DISTINCT FROM OLD.content
     OR NEW.image_url IS DISTINCT FROM OLD.image_url
     OR NEW.video_url IS DISTINCT FROM OLD.video_url
     OR NEW.conversation_id IS DISTINCT FROM OLD.conversation_id
     OR NEW.sender_id IS DISTINCT FROM OLD.sender_id
     OR NEW.created_at IS DISTINCT FROM OLD.created_at
  THEN
    RAISE EXCEPTION 'Only allowed update is setting is_read=true';
  END IF;

  -- Keep updated_at current
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_dm_recipient_update ON public.direct_messages;
CREATE TRIGGER trg_enforce_dm_recipient_update
BEFORE UPDATE ON public.direct_messages
FOR EACH ROW
EXECUTE FUNCTION public.enforce_direct_message_recipient_update();

-- 3) Ensure realtime includes this table (safe if already added)
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.direct_messages;
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END;
$$;