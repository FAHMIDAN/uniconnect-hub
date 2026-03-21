import { useState, useMemo, useEffect } from "react";
import { SearchBar } from "@/components/SearchBar";
import { FilterBar } from "@/components/FilterBar";
import { MaterialCard } from "@/components/MaterialCard";
import { StatsGrid } from "@/components/StatsGrid";
import { Chatbot } from "@/components/Chatbot";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ProfileEdit } from "@/components/ProfileEdit";
import { GraduationCap } from "lucide-react";
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

const StudentDashboard = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [course, setCourse] = useState("all");
  const [semester, setSemester] = useState("all");
  const [type, setType] = useState("all");
  const [materials, setMaterials] = useState<MaterialWithCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    fetchMaterials();
  }, []);

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
              Welcome{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ""}! Browse and download study materials.
            </p>
            <ProfileEdit />
          </div>
        </motion.div>

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

      <Chatbot />
    </div>
  );
};

export default StudentDashboard;
