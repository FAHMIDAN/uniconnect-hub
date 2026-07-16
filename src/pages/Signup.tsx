import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GraduationCap, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

type CourseOption = { id: string; name: string; code: string; semesters: number };

const Signup = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [courseId, setCourseId] = useState("");
  const [semester, setSemester] = useState("");
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setCoursesLoading(true);
    supabase
      .from("courses")
      .select("id, name, code, semesters")
      .order("name")
      .then(({ data }) => {
        setCourses(data ?? []);
        setCoursesLoading(false);
      });
  }, []);

  const selectedCourse = courses.find((c) => c.id === courseId);
  const semCount = selectedCourse?.semesters ?? 8;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nameRegex = /^[A-Za-z\s]{2,50}$/;
    if (!nameRegex.test(fullName.trim())) {
      toast.error("Full Name must contain only alphabets and spaces (Min 2 characters)");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (!courseId) {
      toast.error("Please select your course");
      return;
    }
    if (!semester) {
      toast.error("Please select your semester");
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password, fullName, courseId, Number(semester));
      toast.success("Account created! Check your email to verify.");
      navigate("/login");
    } catch (err: any) {
      toast.error(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <div className="inline-flex gradient-primary p-3 rounded-xl mb-4">
            <GraduationCap className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="font-heading font-bold text-2xl text-foreground">Create account</h1>
          <p className="text-sm text-muted-foreground font-body mt-1">Join SSC Study Hub today</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card rounded-xl p-6 space-y-4">
          <div>
            <Label className="font-body text-sm">Full Name</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" required className="mt-1 font-body" />
          </div>
          <div>
            <Label className="font-body text-sm">Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="mt-1 font-body" />
          </div>
          <div>
            <Label className="font-body text-sm">Password</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" required className="mt-1 font-body" />
          </div>
          <div>
            <Label className="font-body text-sm">Course</Label>
            <Select value={courseId} onValueChange={(v) => { setCourseId(v); setSemester(""); }} required>
              <SelectTrigger className="mt-1 font-body">
                <SelectValue placeholder="Select your course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name} ({c.code})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="font-body text-sm">Semester</Label>
            <Select value={semester} onValueChange={setSemester} required>
              <SelectTrigger className="mt-1 font-body">
                <SelectValue placeholder="Select your semester" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: semCount }, (_, i) => (
                  <SelectItem key={i + 1} value={String(i + 1)}>Semester {i + 1}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={loading} className="w-full gradient-primary text-primary-foreground font-body gap-2">
            <UserPlus className="h-4 w-4" />
            {loading ? "Creating account..." : "Sign Up"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground font-body mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;
