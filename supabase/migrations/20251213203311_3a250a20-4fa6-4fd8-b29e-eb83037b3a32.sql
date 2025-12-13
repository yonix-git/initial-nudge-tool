-- Remove INSERT policy that allows anyone to create verification codes
-- Edge functions use service role key and bypass RLS, so they can still insert
DROP POLICY IF EXISTS "Anyone can create verification codes" ON public.verification_codes;