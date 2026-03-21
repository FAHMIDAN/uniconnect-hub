import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { User, Save } from "lucide-react";
import { toast } from "sonner";

interface Course {
  id: string;
  name: string;
  semesters: number;
}

export function ProfileEdit() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [courseId, setCourseId] = useState("");
  const [currentSemester, setCurrentSemester] = useState("1");
  const [courses, setCourses] = useState<Course[]>([]);
  const [maxSemesters, setMaxSemesters] = useState(8);

  useEffect(() => {
    if (open && user) {
      fetchProfile();
      fetchCourses();
    }
  }, [open, user]);

  useEffect(() => {
    const selected = courses.find((c) => c.id === courseId);
    if (selected) setMaxSemesters(selected.semesters);
  }, [courseId, courses]);

  const fetchCourses = async () => {
    const { data } = await supabase.from("courses").select("id, name, semesters").order("name");
    if (data) setCourses(data);
  };

  const fetchProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("full_name, phone, bio, course_id, current_semester")
      .eq("user_id", user.id)
      .maybeSingle();
    if (data) {
      setFullName(data.full_name || "");
      setPhone(data.phone || "");
      setBio(data.bio || "");
      setCourseId(data.course_id || "");
      setCurrentSemester(String(data.current_semester || 1));
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        phone,
        bio,
        course_id: courseId || null,
        current_semester: Number(currentSemester),
      })
      .eq("user_id", user.id);

    if (error) {
      toast.error("Failed to update profile");
    } else {
      toast.success("Profile updated!");
      setOpen(false);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="font-body gap-1.5 text-xs">
          <User className="h-3.5 w-3.5" /> Edit Profile
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">Edit Profile</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <Label className="font-body text-sm">Full Name</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1 font-body" />
          </div>
          <div>
            <Label className="font-body text-sm">Phone</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 9876543210" className="mt-1 font-body" />
          </div>
          <div>
            <Label className="font-body text-sm">Course</Label>
            <Select value={courseId} onValueChange={setCourseId}>
              <SelectTrigger className="mt-1 font-body"><SelectValue placeholder="Select your course" /></SelectTrigger>
              <SelectContent>
                {courses.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="font-body text-sm">Current Semester</Label>
            <Select value={currentSemester} onValueChange={setCurrentSemester}>
              <SelectTrigger className="mt-1 font-body"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Array.from({ length: maxSemesters }, (_, i) => (
                  <SelectItem key={i + 1} value={String(i + 1)}>Semester {i + 1}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="font-body text-sm">Bio</Label>
            <Textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about yourself..." className="mt-1 font-body" rows={3} />
          </div>
          <Button onClick={handleSave} disabled={loading} className="w-full gradient-primary text-primary-foreground font-body gap-2">
            <Save className="h-4 w-4" />
            {loading ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
