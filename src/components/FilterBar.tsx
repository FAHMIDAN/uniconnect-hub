import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { courses } from "@/lib/data";

interface FilterBarProps {
  selectedCourse: string;
  onCourseChange: (value: string) => void;
  selectedSemester: string;
  onSemesterChange: (value: string) => void;
  selectedType: string;
  onTypeChange: (value: string) => void;
  maxSemesters?: number;
}

export function FilterBar({
  selectedCourse,
  onCourseChange,
  selectedSemester,
  onSemesterChange,
  selectedType,
  onTypeChange,
  maxSemesters = 8,
}: FilterBarProps) {
  const selectedCourseData = courses.find(c => c.name === selectedCourse);
  const semCount = selectedCourseData?.semesters ?? maxSemesters;

  return (
    <div className="flex flex-wrap gap-2">
      <Select value={selectedCourse} onValueChange={onCourseChange}>
        <SelectTrigger className="w-[200px] bg-card font-body text-sm">
          <SelectValue placeholder="All Courses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Courses</SelectItem>
          {courses.map(c => (
            <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={selectedSemester} onValueChange={onSemesterChange}>
        <SelectTrigger className="w-[150px] bg-card font-body text-sm">
          <SelectValue placeholder="All Semesters" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Semesters</SelectItem>
          {Array.from({ length: semCount }, (_, i) => (
            <SelectItem key={i + 1} value={String(i + 1)}>Semester {i + 1}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={selectedType} onValueChange={onTypeChange}>
        <SelectTrigger className="w-[170px] bg-card font-body text-sm">
          <SelectValue placeholder="All Types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="notes">Notes</SelectItem>
          <SelectItem value="syllabus">Syllabus</SelectItem>
          <SelectItem value="question-paper">Question Papers</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
