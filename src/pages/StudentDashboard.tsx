import { useState, useMemo, useEffect } from "react";
import { SearchBar } from "@/components/SearchBar";
import { FilterBar } from "@/components/FilterBar";
import { MaterialCard } from "@/components/MaterialCard";
import { StatsGrid } from "@/components/StatsGrid";
import { Chatbot } from "@/components/Chatbot";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ProfileEdit } from "@/components/ProfileEdit";
import { GraduationCap, Bell } from "lucide-react";
import { motion } from "framer-motion";

interface MaterialWithCourse {
  id: string;
  title: string;
  type: string;
  course: string;
  semester: number;
  subject: string;
  uploadedAt: string;
  fileSize: string;
  downloadCount: number;
  fileUrl?: string;
}

interface Announcement {
  id: string;
  title: string;
  message: string;
  created_at: string;
  courses?: { name: string } | null;
}

interface UserProfile {
  full_name: string | null;
  course_id: string | null;
  current_semester: number | null;
  courses?: { name: string } | null;
}

const StudentDashboard = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [course, setCourse] = useState("all");
  const [semester, setSemester] = useState("all");
  const [type, setType] = useState("all");
  const [materials, setMaterials] = useState<MaterialWithCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchAnnouncements();
    }
    fetchMaterials();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("full_name, course_id, current_semester, courses:course_id(name)")
      .eq("user_id", user.id)
      .maybeSingle();
    if (data) setProfile(data as any);
  };

  const fetchAnnouncements = async () => {
    const { data } = await supabase
      .from("announcements")
      .select("id, title, message, created_at, courses:course_id(name)")
      .order("created_at", { ascending: false })
      .limit(5);
    if (data) setAnnouncements(data as any);
  };

  const fetchMaterials = async () => {
    const { data, error } = await supabase
      .from("materials")
      .select("*, courses(name)")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setMaterials(
        data.map((m: any) => ({
          id: m.id,
          title: m.title,
          type: m.type,
          course: m.courses?.name || "",
          semester: m.semester,
          subject: m.subject,
          uploadedAt: m.created_at?.split("T")[0] || "",
          fileSize: m.file_size || "N/A",
          downloadCount: m.download_count || 0,
          fileUrl: m.file_url,
        }))
      );
    }
    setLoading(false);
  };

  const displayName = profile?.full_name || user?.user_metadata?.full_name || "";

  const filtered = useMemo(() => {
    return materials.filter((m) => {
      const matchesSearch = !search || m.title.toLowerCase().includes(search.toLowerCase()) || m.subject.toLowerCase().includes(search.toLowerCase());
      const matchesCourse = course === "all" || m.course === course;
      const matchesSemester = semester === "all" || m.semester === Number(semester);
      const matchesType = type === "all" || m.type === type;
      return matchesSearch && matchesCourse && matchesSemester && matchesType;
    });
  }, [search, course, semester, type, materials]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <GraduationCap className="h-5 w-5 text-primary" />
            <h1 className="font-heading font-bold text-xl text-foreground">Study Hub</h1>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground font-body">
              Welcome{displayName ? `, ${displayName}` : ""}! Browse and download study materials.
            </p>
            <ProfileEdit onProfileUpdated={fetchProfile} />
          </div>
        </motion.div>

        {/* Announcements */}
        {announcements.length > 0 && (
          <div className="mb-6 space-y-2">
            {announcements.map((a) => (
              <motion.div key={a.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="glass-card rounded-lg p-3 flex items-start gap-3 border-l-4 border-l-primary">
                <Bell className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="font-heading font-semibold text-sm text-foreground">{a.title}</p>
                  <p className="text-xs text-muted-foreground font-body mt-0.5">{a.message}</p>
                  <div className="flex gap-2 mt-1">
                    {a.courses?.name && <span className="text-[10px] text-primary font-body">{a.courses.name}</span>}
                    <span className="text-[10px] text-muted-foreground font-body">{a.created_at?.split("T")[0]}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <div className="mb-6"><StatsGrid /></div>

        <div className="space-y-3 mb-6">
          <SearchBar value={search} onChange={setSearch} />
          <FilterBar selectedCourse={course} onCourseChange={setCourse} selectedSemester={semester} onSemesterChange={setSemester} selectedType={type} onTypeChange={setType} />
        </div>

        <div className="space-y-2">
          <p className="text-xs text-muted-foreground font-body">{filtered.length} materials found</p>
          {loading ? (
            <div className="text-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" /></div>
          ) : filtered.length > 0 ? (
            <div className="grid gap-3">
              {filtered.map((m, i) => (
                <MaterialCard key={m.id} material={m as any} index={i} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground font-body">No materials found. Try adjusting your filters.</p>
            </div>
          )}
        </div>
      </div>

      <Chatbot userProfile={profile} />
    </div>
  );
};

export default StudentDashboard;
