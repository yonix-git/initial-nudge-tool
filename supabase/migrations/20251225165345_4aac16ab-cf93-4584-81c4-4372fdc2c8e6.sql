-- Fix verification_codes RLS - Block all client access
-- Edge functions use service role key which bypasses RLS

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Anyone can create verification codes" ON public.verification_codes;
DROP POLICY IF EXISTS "Users can read their own codes" ON public.verification_codes;
DROP POLICY IF EXISTS "Anyone can verify codes" ON public.verification_codes;

-- Create restrictive policy that blocks all client access
-- Verification operations happen through edge functions with service role
CREATE POLICY "Block all client access to verification codes"
ON public.verification_codes
FOR ALL
USING (false)
WITH CHECK (false);