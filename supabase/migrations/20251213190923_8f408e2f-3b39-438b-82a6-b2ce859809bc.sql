-- Fix verification_codes RLS policies - remove overly permissive policies
-- and keep only service role access (edge functions handle this securely)

-- Drop the overly permissive SELECT policy if it exists
DROP POLICY IF EXISTS "Users can read their own codes" ON public.verification_codes;

-- Drop the overly permissive UPDATE policy if it exists  
DROP POLICY IF EXISTS "Anyone can verify codes" ON public.verification_codes;

-- Ensure the restrictive policies remain (these should already exist from migration 20251122192843)
-- Re-create them to be sure they are properly configured

-- Service role can read verification codes
DROP POLICY IF EXISTS "Service role can read verification codes" ON public.verification_codes;
CREATE POLICY "Service role can read verification codes"
  ON public.verification_codes
  FOR SELECT
  TO service_role
  USING (true);

-- Service role can update verification codes
DROP POLICY IF EXISTS "Service role can update verification codes" ON public.verification_codes;
CREATE POLICY "Service role can update verification codes"
  ON public.verification_codes
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Authenticated users can only read their own codes (by email)
DROP POLICY IF EXISTS "Authenticated users can read their own verification codes" ON public.verification_codes;
CREATE POLICY "Authenticated users can read their own verification codes"
  ON public.verification_codes
  FOR SELECT
  TO authenticated
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid())::text);

-- Users can only verify their own codes
DROP POLICY IF EXISTS "Users can verify their own codes" ON public.verification_codes;
CREATE POLICY "Users can verify their own codes"
  ON public.verification_codes
  FOR UPDATE
  TO authenticated
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid())::text);

-- Anyone can create verification codes (needed for signup flow)
DROP POLICY IF EXISTS "Anyone can create verification codes" ON public.verification_codes;
CREATE POLICY "Anyone can create verification codes"
  ON public.verification_codes
  FOR INSERT
  WITH CHECK (true);