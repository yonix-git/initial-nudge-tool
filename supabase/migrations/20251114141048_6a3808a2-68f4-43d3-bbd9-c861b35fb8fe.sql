-- Add business-related columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS business_phone text,
ADD COLUMN IF NOT EXISTS business_address text,
ADD COLUMN IF NOT EXISTS business_hours jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS business_categories text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS business_description text;