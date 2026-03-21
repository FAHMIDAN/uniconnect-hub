
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS current_semester integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS course_id uuid REFERENCES public.courses(id),
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS bio text;
