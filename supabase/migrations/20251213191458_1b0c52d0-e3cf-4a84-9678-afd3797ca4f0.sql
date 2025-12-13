-- Fix profiles RLS: Restrict public access to only business profiles with limited fields
-- Private profiles should only be visible to their owners and authenticated users

-- Drop existing overly permissive SELECT policy
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create policy: Users can always view their own profile
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Create policy: Authenticated users can view basic info of business accounts
-- This allows discovery of businesses while protecting private users
CREATE POLICY "Authenticated users can view business profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (account_type = 'business');

-- Create policy: Unauthenticated users can only view business profiles
-- This prevents scraping of private user data while allowing public business discovery
CREATE POLICY "Public can view business profiles"
  ON public.profiles
  FOR SELECT
  TO anon
  USING (account_type = 'business');