-- Fix profiles RLS: Allow authenticated users to view ALL profiles (private and business)
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view business profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public can view business profiles" ON public.profiles;

-- Create new policy: Authenticated users can view ALL profiles
CREATE POLICY "Authenticated users can view all profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Keep anon users restricted to business profiles only (for public discovery)
CREATE POLICY "Public can view business profiles"
  ON public.profiles
  FOR SELECT
  TO anon
  USING (account_type = 'business');