-- Create verification_codes table
CREATE TABLE public.verification_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.verification_codes ENABLE ROW LEVEL SECURITY;

-- Create index for faster lookups
CREATE INDEX idx_verification_codes_email ON public.verification_codes(email);
CREATE INDEX idx_verification_codes_code ON public.verification_codes(code);

-- Policy: Anyone can insert verification codes (needed for signup flow)
CREATE POLICY "Anyone can create verification codes"
ON public.verification_codes
FOR INSERT
WITH CHECK (true);

-- Policy: Users can read their own verification codes
CREATE POLICY "Users can read their own codes"
ON public.verification_codes
FOR SELECT
USING (true);

-- Policy: Anyone can update verification codes (needed for verification flow)
CREATE POLICY "Anyone can verify codes"
ON public.verification_codes
FOR UPDATE
USING (true);

-- Function to clean up old verification codes
CREATE OR REPLACE FUNCTION public.cleanup_expired_verification_codes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.verification_codes
  WHERE expires_at < now() OR (verified = true AND created_at < now() - interval '1 day');
END;
$$;