-- Allow admin to update business_upgrade_requests status
CREATE POLICY "Admin can update all upgrade requests"
ON public.business_upgrade_requests
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email = 'yoni2435@gmail.com'
  )
);

-- Allow admin to view all upgrade requests
CREATE POLICY "Admin can view all upgrade requests"
ON public.business_upgrade_requests
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email = 'yoni2435@gmail.com'
  )
);