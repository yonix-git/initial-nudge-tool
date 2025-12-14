-- Drop the problematic policies
DROP POLICY IF EXISTS "Admin can update all upgrade requests" ON public.business_upgrade_requests;
DROP POLICY IF EXISTS "Admin can view all upgrade requests" ON public.business_upgrade_requests;

-- Create a security definer function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.email = 'yoni2435@gmail.com'
  )
$$;

-- Create new policies using the function
CREATE POLICY "Admin can view all upgrade requests"
ON public.business_upgrade_requests
FOR SELECT
USING (public.is_admin());

CREATE POLICY "Admin can update all upgrade requests"
ON public.business_upgrade_requests
FOR UPDATE
USING (public.is_admin());