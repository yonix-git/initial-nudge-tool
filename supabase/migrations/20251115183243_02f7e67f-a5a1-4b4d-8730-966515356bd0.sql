-- Drop the existing insecure policy
DROP POLICY IF EXISTS "Users can read their own codes" ON public.verification_codes;

-- Create a more secure policy that only allows reading verification codes
-- through server-side functions (service role), not client-side
-- This prevents public exposure of email addresses and codes
CREATE POLICY "Service role can read verification codes"
ON public.verification_codes
FOR SELECT
TO service_role
USING (true);

-- For authenticated users, only allow them to read codes for their own email
CREATE POLICY "Authenticated users can read their own verification codes"
ON public.verification_codes
FOR SELECT
TO authenticated
USING (
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- Update the update policy to be more restrictive
DROP POLICY IF EXISTS "Anyone can verify codes" ON public.verification_codes;

CREATE POLICY "Users can verify their own codes"
ON public.verification_codes
FOR UPDATE
TO authenticated
USING (
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
);