CREATE POLICY "Authenticated users can upload to materials"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'materials');

CREATE POLICY "Anyone can read materials"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'materials');