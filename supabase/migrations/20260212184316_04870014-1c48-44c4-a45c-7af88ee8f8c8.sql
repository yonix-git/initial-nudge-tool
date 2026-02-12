-- Allow admin to update any profile (for business upgrade approvals)
CREATE POLICY "Admins can update any profile"
ON public.profiles
FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

