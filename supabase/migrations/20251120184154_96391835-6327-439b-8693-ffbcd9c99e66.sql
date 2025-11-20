-- Add status column to group_members table
ALTER TABLE public.group_members 
ADD COLUMN status text NOT NULL DEFAULT 'approved'
CHECK (status IN ('pending', 'approved'));

-- Add index for better performance
CREATE INDEX idx_group_members_status ON public.group_members(status);

-- Update RLS policies for group_members to handle pending requests
DROP POLICY IF EXISTS "Authenticated users can join groups" ON public.group_members;

CREATE POLICY "Authenticated users can request to join groups" 
ON public.group_members 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Allow group creators to view all members including pending
CREATE POLICY "Group creators can view all member requests" 
ON public.group_members 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.groups 
    WHERE groups.id = group_members.group_id 
    AND groups.creator_id = auth.uid()
  )
  OR (auth.uid() = user_id)
);

-- Allow group creators to update member status
CREATE POLICY "Group creators can update member status" 
ON public.group_members 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.groups 
    WHERE groups.id = group_members.group_id 
    AND groups.creator_id = auth.uid()
  )
);

-- Update the trigger to only count approved members
CREATE OR REPLACE FUNCTION public.update_group_members_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.groups
    SET members = (
      SELECT COUNT(*) FROM public.group_members 
      WHERE group_id = COALESCE(NEW.group_id, OLD.group_id)
      AND status = 'approved'
    )
    WHERE id = COALESCE(NEW.group_id, OLD.group_id);
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.groups
    SET members = (
      SELECT COUNT(*) FROM public.group_members 
      WHERE group_id = OLD.group_id
      AND status = 'approved'
    )
    WHERE id = OLD.group_id;
  END IF;
  RETURN NULL;
END;
$$;