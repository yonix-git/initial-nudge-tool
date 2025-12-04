-- Add columns for multiple images/videos in posts
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS image_urls TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS video_urls TEXT[] DEFAULT '{}';

-- Migrate existing data from single columns to arrays
UPDATE public.posts 
SET image_urls = ARRAY[image_url] 
WHERE image_url IS NOT NULL AND (image_urls IS NULL OR image_urls = '{}');

UPDATE public.posts 
SET video_urls = ARRAY[video_url] 
WHERE video_url IS NOT NULL AND (video_urls IS NULL OR video_urls = '{}');

-- Add column for multiple images in products
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS image_urls TEXT[] DEFAULT '{}';

-- Migrate existing data
UPDATE public.products 
SET image_urls = ARRAY[image_url] 
WHERE image_url IS NOT NULL AND (image_urls IS NULL OR image_urls = '{}');