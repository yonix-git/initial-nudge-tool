-- Ensure all user-related data is deleted when a user is deleted
-- Add ON DELETE CASCADE to all foreign keys referencing profiles or auth.users

-- Posts table
ALTER TABLE public.posts
DROP CONSTRAINT IF EXISTS posts_user_id_fkey,
ADD CONSTRAINT posts_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- Comments table  
ALTER TABLE public.comments
DROP CONSTRAINT IF EXISTS fk_comments_user_profile,
ADD CONSTRAINT fk_comments_user_profile
  FOREIGN KEY (user_id)
  REFERENCES public.profiles(id)
  ON DELETE CASCADE;

-- Likes table
ALTER TABLE public.likes
DROP CONSTRAINT IF EXISTS likes_user_id_fkey,
ADD CONSTRAINT likes_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;

-- Reviews table (both reviewer and business)
ALTER TABLE public.reviews
DROP CONSTRAINT IF EXISTS reviews_reviewer_id_fkey,
ADD CONSTRAINT reviews_reviewer_id_fkey
  FOREIGN KEY (reviewer_id)
  REFERENCES public.profiles(id)
  ON DELETE CASCADE;

ALTER TABLE public.reviews
DROP CONSTRAINT IF EXISTS reviews_business_id_fkey,
ADD CONSTRAINT reviews_business_id_fkey
  FOREIGN KEY (business_id)
  REFERENCES public.profiles(id)
  ON DELETE CASCADE;

-- Products table
ALTER TABLE public.products
DROP CONSTRAINT IF EXISTS products_business_id_fkey,
ADD CONSTRAINT products_business_id_fkey
  FOREIGN KEY (business_id)
  REFERENCES public.profiles(id)
  ON DELETE CASCADE;

-- Events table
ALTER TABLE public.events
DROP CONSTRAINT IF EXISTS events_creator_id_fkey,
ADD CONSTRAINT events_creator_id_fkey
  FOREIGN KEY (creator_id)
  REFERENCES auth.users(id)
  ON DELETE SET NULL;

-- Event participants
ALTER TABLE public.event_participants
DROP CONSTRAINT IF EXISTS event_participants_user_id_fkey,
ADD CONSTRAINT event_participants_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;

-- Event interested
ALTER TABLE public.event_interested
DROP CONSTRAINT IF EXISTS event_interested_user_id_fkey,
ADD CONSTRAINT event_interested_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;

-- Groups table
ALTER TABLE public.groups
DROP CONSTRAINT IF EXISTS groups_creator_id_fkey,
ADD CONSTRAINT groups_creator_id_fkey
  FOREIGN KEY (creator_id)
  REFERENCES auth.users(id)
  ON DELETE SET NULL;

-- Group members
ALTER TABLE public.group_members
DROP CONSTRAINT IF EXISTS group_members_user_id_fkey,
ADD CONSTRAINT group_members_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;

-- Group messages
ALTER TABLE public.group_messages
DROP CONSTRAINT IF EXISTS group_messages_user_id_fkey,
ADD CONSTRAINT group_messages_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;

-- Services table
ALTER TABLE public.services
DROP CONSTRAINT IF EXISTS services_creator_id_fkey,
ADD CONSTRAINT services_creator_id_fkey
  FOREIGN KEY (creator_id)
  REFERENCES auth.users(id)
  ON DELETE SET NULL;

-- Notifications table
ALTER TABLE public.notifications
DROP CONSTRAINT IF EXISTS notifications_user_id_fkey,
ADD CONSTRAINT notifications_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;

ALTER TABLE public.notifications
DROP CONSTRAINT IF EXISTS notifications_sender_id_fkey,
ADD CONSTRAINT notifications_sender_id_fkey
  FOREIGN KEY (sender_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;

-- Notification settings
ALTER TABLE public.notification_settings
DROP CONSTRAINT IF EXISTS notification_settings_user_id_fkey,
ADD CONSTRAINT notification_settings_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;