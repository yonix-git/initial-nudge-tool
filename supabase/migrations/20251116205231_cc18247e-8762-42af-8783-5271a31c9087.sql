-- Add foreign key from comments to profiles
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_comments_user_profile'
    ) THEN
        ALTER TABLE public.comments 
        ADD CONSTRAINT fk_comments_user_profile 
        FOREIGN KEY (user_id) 
        REFERENCES public.profiles(id) 
        ON DELETE CASCADE;
    END IF;
END $$;