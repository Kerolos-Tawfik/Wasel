-- =============================================
-- Avatar Storage Bucket for MarketPlace
-- =============================================

-- Create storage bucket for user avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- STORAGE POLICIES FOR AVATARS
-- =============================================

-- Drop existing policies if they exist (for clean re-run)
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

-- Policy: Anyone can view avatar images (public bucket)
CREATE POLICY "Avatar images are publicly accessible"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'avatars');

-- Policy: Authenticated users can upload their own avatar
-- Files must be in folder named after user's ID: {user_id}/avatar.{ext}
CREATE POLICY "Users can upload their own avatar"
    ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'avatars' 
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Policy: Users can update their own avatar
CREATE POLICY "Users can update their own avatar"
    ON storage.objects
    FOR UPDATE
    USING (
        bucket_id = 'avatars'
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Policy: Users can delete their own avatar
CREATE POLICY "Users can delete their own avatar"
    ON storage.objects
    FOR DELETE
    USING (
        bucket_id = 'avatars'
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- =============================================
-- PROFILES TABLE UPDATE (if needed)
-- Add avatar_url column if it doesn't exist
-- =============================================

-- Add avatar_url column to profiles table if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'avatar_url'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN avatar_url TEXT;
    END IF;
END $$;

-- Add title column to profiles table if not exists (for professional title)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'title'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN title VARCHAR(255);
    END IF;
END $$;

-- Add bio column to profiles table if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'bio'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN bio TEXT;
    END IF;
END $$;

-- Add city column to profiles table if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'city'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN city VARCHAR(100);
    END IF;
END $$;

-- Add provider_type column to profiles table (freelance|local)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'profiles'
        AND column_name = 'provider_type'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN provider_type VARCHAR(32);
    END IF;
END $$;
