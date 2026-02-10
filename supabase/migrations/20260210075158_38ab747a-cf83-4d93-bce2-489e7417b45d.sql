-- Create table for laundry batches
CREATE TABLE public.laundry_batches (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for cloth items within batches
CREATE TABLE public.batch_items (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    batch_id UUID NOT NULL REFERENCES public.laundry_batches(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    photo TEXT NOT NULL,
    label TEXT,
    tag TEXT NOT NULL DEFAULT 'shirt',
    is_received BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.laundry_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batch_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for laundry_batches (private per user)
CREATE POLICY "Users can view their own batches"
ON public.laundry_batches
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own batches"
ON public.laundry_batches
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own batches"
ON public.laundry_batches
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own batches"
ON public.laundry_batches
FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for batch_items (private per user)
CREATE POLICY "Users can view their own batch items"
ON public.batch_items
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own batch items"
ON public.batch_items
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own batch items"
ON public.batch_items
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own batch items"
ON public.batch_items
FOR DELETE
USING (auth.uid() = user_id);

-- Add user_id to existing clothes table for private wardrobe
ALTER TABLE public.clothes ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop old public policies on clothes table
DROP POLICY IF EXISTS "Anyone can view clothes" ON public.clothes;
DROP POLICY IF EXISTS "Anyone can insert clothes" ON public.clothes;
DROP POLICY IF EXISTS "Anyone can update clothes" ON public.clothes;
DROP POLICY IF EXISTS "Anyone can delete clothes" ON public.clothes;

-- Create new private policies for clothes
CREATE POLICY "Users can view their own clothes"
ON public.clothes
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own clothes"
ON public.clothes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clothes"
ON public.clothes
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clothes"
ON public.clothes
FOR DELETE
USING (auth.uid() = user_id);

-- Add user_id to custom_tags for private tags
ALTER TABLE public.custom_tags ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop old public policies on custom_tags
DROP POLICY IF EXISTS "Anyone can view custom tags" ON public.custom_tags;
DROP POLICY IF EXISTS "Anyone can insert custom tags" ON public.custom_tags;
DROP POLICY IF EXISTS "Anyone can delete custom tags" ON public.custom_tags;

-- Create new private policies for custom_tags
CREATE POLICY "Users can view their own custom tags"
ON public.custom_tags
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own custom tags"
ON public.custom_tags
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own custom tags"
ON public.custom_tags
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own custom tags"
ON public.custom_tags
FOR DELETE
USING (auth.uid() = user_id);