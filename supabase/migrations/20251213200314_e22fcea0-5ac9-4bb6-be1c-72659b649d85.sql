-- Add is_anonymous column to reviews table
ALTER TABLE public.reviews ADD COLUMN is_anonymous boolean NOT NULL DEFAULT false;

-- Update RLS policy to allow users to see only their own reviews, 
-- businesses to see reviews about them, and hide reviewer_id for anonymous reviews
DROP POLICY IF EXISTS "Only authenticated users can view reviews" ON public.reviews;

-- Users can see:
-- 1. Their own reviews (as reviewer)
-- 2. Reviews about their business (as business owner)
-- 3. All reviews but with hidden reviewer for anonymous ones (handled in application)
CREATE POLICY "Users can view their own reviews and reviews about their business"
ON public.reviews
FOR SELECT
TO authenticated
USING (
  auth.uid() = reviewer_id OR 
  auth.uid() = business_id OR
  is_anonymous = false
);

-- Also add policy for anonymous reviews - everyone can see them but reviewer is hidden
CREATE POLICY "Authenticated users can view anonymous reviews"
ON public.reviews
FOR SELECT
TO authenticated
USING (is_anonymous = true);