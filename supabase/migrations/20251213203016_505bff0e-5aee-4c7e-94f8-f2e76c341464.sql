-- Remove SELECT policies that allow users to read verification codes
-- Edge functions use service role key and bypass RLS, so no SELECT policy is needed

DROP POLICY IF EXISTS "Authenticated users can read their own verification codes" ON public.verification_codes;
DROP POLICY IF EXISTS "Service role can read verification codes" ON public.verification_codes;
DROP POLICY IF EXISTS "Service role can update verification codes" ON public.verification_codes;
DROP POLICY IF EXISTS "Users can verify their own codes" ON public.verification_codes;

-- Keep only the INSERT policy for creating new codes
-- All read/update operations happen through edge functions with service role key