-- Create group_messages table
CREATE TABLE public.group_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id uuid NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text,
  image_url text,
  video_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.group_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view messages in groups they're members of or created
CREATE POLICY "Users can view messages in their groups"
ON public.group_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.groups
    WHERE id = group_messages.group_id
    AND creator_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = group_messages.group_id
    AND user_id = auth.uid()
    AND status = 'approved'
  )
);

-- Policy: Approved members can insert messages
CREATE POLICY "Approved members can send messages"
ON public.group_messages
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.groups
    WHERE id = group_messages.group_id
    AND creator_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = group_messages.group_id
    AND user_id = auth.uid()
    AND status = 'approved'
  )
);

-- Policy: Users can update their own messages
CREATE POLICY "Users can update their own messages"
ON public.group_messages
FOR UPDATE
USING (auth.uid() = user_id);

-- Policy: Users can delete their own messages
CREATE POLICY "Users can delete their own messages"
ON public.group_messages
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for better query performance
CREATE INDEX idx_group_messages_group_id ON public.group_messages(group_id);
CREATE INDEX idx_group_messages_created_at ON public.group_messages(created_at DESC);

-- Add trigger for updated_at
CREATE TRIGGER update_group_messages_updated_at
BEFORE UPDATE ON public.group_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for group messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_messages;