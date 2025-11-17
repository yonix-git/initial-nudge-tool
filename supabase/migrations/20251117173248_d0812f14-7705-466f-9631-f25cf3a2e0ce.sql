-- Allow posts without text content (content can be empty if there's media)
ALTER TABLE public.posts ALTER COLUMN content DROP NOT NULL;

-- Update the check to ensure at least content OR media exists
-- This will be handled at the application level