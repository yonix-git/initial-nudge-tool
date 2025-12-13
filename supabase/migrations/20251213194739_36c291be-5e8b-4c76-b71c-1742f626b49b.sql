-- Drop the overly permissive SELECT policies
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public can view business profiles" ON public.profiles;

-- Create new policy that requires authentication to view profiles
CREATE POLICY "Only authenticated users can view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);
