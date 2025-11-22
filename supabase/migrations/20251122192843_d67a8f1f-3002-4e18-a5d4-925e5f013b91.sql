-- Add policy to allow service role to update verification codes
CREATE POLICY "Service role can update verification codes"
ON verification_codes
FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);