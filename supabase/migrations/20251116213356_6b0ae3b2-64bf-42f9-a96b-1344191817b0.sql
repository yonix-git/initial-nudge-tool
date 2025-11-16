-- Add business_type column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS business_type text;

-- Add comment to explain the field
COMMENT ON COLUMN public.profiles.business_type IS 'Type of business: garage or independent_professional';