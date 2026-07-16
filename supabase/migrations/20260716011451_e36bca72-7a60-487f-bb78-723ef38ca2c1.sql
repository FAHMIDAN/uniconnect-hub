GRANT SELECT ON public.courses TO anon;
DROP POLICY IF EXISTS "Public can view courses" ON public.courses;
CREATE POLICY "Public can view courses" ON public.courses FOR SELECT TO anon USING (true);