-- Add followers and following counts to profiles table
ALTER TABLE public.profiles 
ADD COLUMN followers_count integer NOT NULL DEFAULT 0,
ADD COLUMN following_count integer NOT NULL DEFAULT 0;