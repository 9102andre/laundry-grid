-- Create storage bucket for cloth photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('cloth-photos', 'cloth-photos', true);

-- Allow anyone to read photos (public bucket)
CREATE POLICY "Public can view cloth photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'cloth-photos');

-- Allow authenticated users to upload photos
CREATE POLICY "Users can upload cloth photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'cloth-photos');

-- Allow authenticated users to delete their photos
CREATE POLICY "Users can delete cloth photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'cloth-photos');

-- Create clothes library table (stores user's wardrobe)
CREATE TABLE public.clothes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  photo_url TEXT NOT NULL,
  label TEXT,
  tag TEXT NOT NULL DEFAULT 'shirt',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.clothes ENABLE ROW LEVEL SECURITY;

-- For now, allow public access (no auth yet)
CREATE POLICY "Anyone can view clothes"
ON public.clothes FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert clothes"
ON public.clothes FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update clothes"
ON public.clothes FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete clothes"
ON public.clothes FOR DELETE
USING (true);

-- Create custom_tags table to persist custom categories
CREATE TABLE public.custom_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '🏷️',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.custom_tags ENABLE ROW LEVEL SECURITY;

-- Public access for now
CREATE POLICY "Anyone can view custom tags"
ON public.custom_tags FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert custom tags"
ON public.custom_tags FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can delete custom tags"
ON public.custom_tags FOR DELETE
USING (true);