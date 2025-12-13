-- Services table
DROP POLICY IF EXISTS "Anyone can view services" ON public.services;
CREATE POLICY "Only authenticated users can view services"
ON public.services
FOR SELECT
TO authenticated
USING (true);

-- Groups table
DROP POLICY IF EXISTS "Anyone can view groups" ON public.groups;
CREATE POLICY "Only authenticated users can view groups"
ON public.groups
FOR SELECT
TO authenticated
USING (true);

-- Posts table
DROP POLICY IF EXISTS "Posts are viewable by everyone" ON public.posts;
CREATE POLICY "Only authenticated users can view posts"
ON public.posts
FOR SELECT
TO authenticated
USING (true);

-- Comments table
DROP POLICY IF EXISTS "Anyone can view comments" ON public.comments;
CREATE POLICY "Only authenticated users can view comments"
ON public.comments
FOR SELECT
TO authenticated
USING (true);

-- Likes table
DROP POLICY IF EXISTS "Anyone can view likes" ON public.likes;
CREATE POLICY "Only authenticated users can view likes"
ON public.likes
FOR SELECT
TO authenticated
USING (true);

-- Events table
DROP POLICY IF EXISTS "Anyone can view events" ON public.events;
CREATE POLICY "Only authenticated users can view events"
ON public.events
FOR SELECT
TO authenticated
USING (true);

-- Event participants table
DROP POLICY IF EXISTS "Anyone can view event participants" ON public.event_participants;
CREATE POLICY "Only authenticated users can view event participants"
ON public.event_participants
FOR SELECT
TO authenticated
USING (true);

-- Event interested table
DROP POLICY IF EXISTS "Anyone can view interested users" ON public.event_interested;
CREATE POLICY "Only authenticated users can view event interested"
ON public.event_interested
FOR SELECT
TO authenticated
USING (true);

-- Group members table
DROP POLICY IF EXISTS "Anyone can view group members" ON public.group_members;
CREATE POLICY "Only authenticated users can view group members"
ON public.group_members
FOR SELECT
TO authenticated
USING (true);

-- Reviews table
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;
CREATE POLICY "Only authenticated users can view reviews"
ON public.reviews
FOR SELECT
TO authenticated
USING (true);

-- Products table
DROP POLICY IF EXISTS "Anyone can view products" ON public.products;
CREATE POLICY "Only authenticated users can view products"
ON public.products
FOR SELECT
TO authenticated
USING (true);