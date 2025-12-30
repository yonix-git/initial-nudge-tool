-- Add reply_to_id column to direct_messages table for message replies
ALTER TABLE public.direct_messages
ADD COLUMN reply_to_id uuid REFERENCES public.direct_messages(id) ON DELETE SET NULL;