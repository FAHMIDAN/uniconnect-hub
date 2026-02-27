import { useState, useMemo } from "react";
import { SearchBar } from "@/components/SearchBar";
import { FilterBar } from "@/components/FilterBar";
import { MaterialCard } from "@/components/MaterialCard";
import { StatsGrid } from "@/components/StatsGrid";
import { materials } from "@/lib/data";
import { GraduationCap } from "lucide-react";
import { motion } from "framer-motion";

const StudentDashboard = () => {
  const [search, setSearch] = useState("");
  const [course, setCourse] = useState("all");
  const [semester, setSemester] = useState("all");
  const [type, setType] = useState("all");

  const filtered = useMemo(() => {
    return materials.filter((m) => {
      const matchesSearch = !search || m.title.toLowerCase().includes(search.toLowerCase()) || m.subject.toLowerCase().includes(search.toLowerCase());
      const matchesCourse = course === "all" || m.course === course;
      const matchesSemester = semester === "all" || m.semester === Number(semester);
      const matchesType = type === "all" || m.type === type;
      return matchesSearch && matchesCourse && matchesSemester && matchesType;
    });
  }, [search, course, semester, type]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-2 mb-1">
            <GraduationCap className="h-5 w-5 text-primary" />
            <h1 className="font-heading font-bold text-xl text-foreground">Study Hub</h1>
          </div>
          <p className="text-sm text-muted-foreground font-body">Browse and download verified study materials</p>
        </motion.div>

        {/* Stats */}
        <div className="mb-6">
          <StatsGrid />
        </div>

        {/* Search & Filters */}
        <div className="space-y-3 mb-6">
          <SearchBar value={search} onChange={setSearch} />
          <FilterBar
            selectedCourse={course}
            onCourseChange={setCourse}
            selectedSemester={semester}
            onSemesterChange={setSemester}
            selectedType={type}
            onTypeChange={setType}
          />
        </div>

        {/* Results */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground font-body">{filtered.length} materials found</p>
          {filtered.length > 0 ? (
            <div className="grid gap-3">
              {filtered.map((m, i) => (
                <MaterialCard key={m.id} material={m} index={i} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground font-body">No materials found. Try adjusting your filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
