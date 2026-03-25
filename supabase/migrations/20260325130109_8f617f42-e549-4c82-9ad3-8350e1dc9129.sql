CREATE POLICY "Students can upload materials"
ON public.materials
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = uploaded_by);