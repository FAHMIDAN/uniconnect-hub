CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _course_id uuid;
  _semester int;
BEGIN
  BEGIN
    _course_id := NULLIF(NEW.raw_user_meta_data->>'course_id', '')::uuid;
  EXCEPTION WHEN OTHERS THEN
    _course_id := NULL;
  END;

  _semester := NULLIF(NEW.raw_user_meta_data->>'semester', '')::int;

  INSERT INTO public.profiles (user_id, email, full_name, course_id, current_semester)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    _course_id,
    COALESCE(_semester, 1)
  );

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student');

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();