-- =============================================
-- Portfolio Table Schema for MarketPlace
-- =============================================

-- Drop existing policies if they exist (for clean re-run)
DROP POLICY IF EXISTS "Portfolio items are viewable by everyone" ON public.portfolio;
DROP POLICY IF EXISTS "Users can insert their own portfolio items" ON public.portfolio;
DROP POLICY IF EXISTS "Users can update their own portfolio items" ON public.portfolio;
DROP POLICY IF EXISTS "Users can delete their own portfolio items" ON public.portfolio;

-- Create the portfolio table
CREATE TABLE IF NOT EXISTS public.portfolio (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    bio VARCHAR(255),            -- Short bio for the project
    description TEXT,
    images TEXT[] DEFAULT '{}',  -- Array of image URLs for multiple photos
    url_image TEXT,              -- Legacy field for backwards compatibility
    link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add bio column if it doesn't exist (for existing tables)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'portfolio' 
                   AND column_name = 'bio') THEN
        ALTER TABLE public.portfolio ADD COLUMN bio VARCHAR(255);
    END IF;
END $$;

-- Create index for faster queries by user_id
CREATE INDEX IF NOT EXISTS idx_portfolio_user_id ON public.portfolio(user_id);

-- Create index for ordering by created_at
CREATE INDEX IF NOT EXISTS idx_portfolio_created_at ON public.portfolio(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.portfolio ENABLE ROW LEVEL SECURITY;

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Policy: Anyone can view portfolio items (public profiles)
CREATE POLICY "Portfolio items are viewable by everyone"
    ON public.portfolio
    FOR SELECT
    USING (true);

-- Policy: Users can insert their own portfolio items
-- This allows inserting with title, description, images array, and link
CREATE POLICY "Users can insert their own portfolio items"
    ON public.portfolio
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own portfolio items
-- This allows updating title, description, images array, and link
CREATE POLICY "Users can update their own portfolio items"
    ON public.portfolio
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own portfolio items
CREATE POLICY "Users can delete their own portfolio items"
    ON public.portfolio
    FOR DELETE
    USING (auth.uid() = user_id);

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_portfolio_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function on update
DROP TRIGGER IF EXISTS trigger_portfolio_updated_at ON public.portfolio;
CREATE TRIGGER trigger_portfolio_updated_at
    BEFORE UPDATE ON public.portfolio
    FOR EACH ROW
    EXECUTE FUNCTION update_portfolio_updated_at();

-- Grant permissions
GRANT SELECT ON public.portfolio TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portfolio TO authenticated;

-- =============================================
-- STORAGE BUCKET FOR PORTFOLIO IMAGES (Optional)
-- Run this in Supabase SQL Editor if you want 
-- to allow users to upload actual image files
-- =============================================

-- Create storage bucket for portfolio images
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio-images', 'portfolio-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Anyone can view portfolio images (public bucket)
CREATE POLICY "Portfolio images are publicly accessible"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'portfolio-images');

-- Policy: Authenticated users can upload their own portfolio images
CREATE POLICY "Users can upload portfolio images"
    ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'portfolio-images' 
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Policy: Users can update their own portfolio images
CREATE POLICY "Users can update their own portfolio images"
    ON storage.objects
    FOR UPDATE
    USING (
        bucket_id = 'portfolio-images'
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Policy: Users can delete their own portfolio images
CREATE POLICY "Users can delete their own portfolio images"
    ON storage.objects
    FOR DELETE
    USING (
        bucket_id = 'portfolio-images'
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- =============================================
-- Sample data (optional - remove in production)
-- =============================================
-- INSERT INTO public.portfolio (user_id, title, description, images, link)
-- VALUES 
--     ('your-user-uuid-here', 'E-commerce Website', 'A modern e-commerce platform built with React and Node.js', ARRAY['https://example.com/image1.jpg', 'https://example.com/image2.jpg'], 'https://example.com/project1'),
--     ('your-user-uuid-here', 'Mobile App Design', 'UI/UX design for a fitness tracking mobile application', ARRAY['https://example.com/image3.jpg'], 'https://example.com/project2');
