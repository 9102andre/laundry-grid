
-- Drop all restrictive policies and recreate as permissive

-- batch_items
DROP POLICY IF EXISTS "Users can create their own batch items" ON public.batch_items;
DROP POLICY IF EXISTS "Users can delete their own batch items" ON public.batch_items;
DROP POLICY IF EXISTS "Users can update their own batch items" ON public.batch_items;
DROP POLICY IF EXISTS "Users can view their own batch items" ON public.batch_items;

CREATE POLICY "Users can view their own batch items" ON public.batch_items FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own batch items" ON public.batch_items FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own batch items" ON public.batch_items FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own batch items" ON public.batch_items FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- clothes
DROP POLICY IF EXISTS "Users can delete their own clothes" ON public.clothes;
DROP POLICY IF EXISTS "Users can insert their own clothes" ON public.clothes;
DROP POLICY IF EXISTS "Users can update their own clothes" ON public.clothes;
DROP POLICY IF EXISTS "Users can view their own clothes" ON public.clothes;

CREATE POLICY "Users can view their own clothes" ON public.clothes FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own clothes" ON public.clothes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own clothes" ON public.clothes FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own clothes" ON public.clothes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- custom_tags
DROP POLICY IF EXISTS "Users can delete their own custom tags" ON public.custom_tags;
DROP POLICY IF EXISTS "Users can insert their own custom tags" ON public.custom_tags;
DROP POLICY IF EXISTS "Users can update their own custom tags" ON public.custom_tags;
DROP POLICY IF EXISTS "Users can view their own custom tags" ON public.custom_tags;

CREATE POLICY "Users can view their own custom tags" ON public.custom_tags FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own custom tags" ON public.custom_tags FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own custom tags" ON public.custom_tags FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own custom tags" ON public.custom_tags FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- laundry_batches
DROP POLICY IF EXISTS "Users can create their own batches" ON public.laundry_batches;
DROP POLICY IF EXISTS "Users can delete their own batches" ON public.laundry_batches;
DROP POLICY IF EXISTS "Users can update their own batches" ON public.laundry_batches;
DROP POLICY IF EXISTS "Users can view their own batches" ON public.laundry_batches;

CREATE POLICY "Users can view their own batches" ON public.laundry_batches FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own batches" ON public.laundry_batches FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own batches" ON public.laundry_batches FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own batches" ON public.laundry_batches FOR DELETE TO authenticated USING (auth.uid() = user_id);
