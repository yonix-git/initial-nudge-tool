-- Create table for business upgrade requests
CREATE TABLE IF NOT EXISTS public.business_upgrade_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.business_upgrade_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own requests
CREATE POLICY "Users can view their own upgrade requests"
ON public.business_upgrade_requests
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can create their own requests
CREATE POLICY "Users can create upgrade requests"
ON public.business_upgrade_requests
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_business_upgrade_requests_updated_at
BEFORE UPDATE ON public.business_upgrade_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();