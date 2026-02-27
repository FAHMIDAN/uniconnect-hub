import { useState } from "react";
import { materials, courses, StudyMaterial } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Edit, Shield, Upload, FileText, BookOpen, HelpCircle } from "lucide-react";
import { StatsGrid } from "@/components/StatsGrid";
import { motion } from "framer-motion";
import { toast } from "sonner";

const typeIcons = {
  notes: FileText,
  syllabus: BookOpen,
  'question-paper': HelpCircle,
};

const AdminDashboard = () => {
  const [allMaterials, setAllMaterials] = useState<StudyMaterial[]>(materials);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<string>("notes");
  const [newCourse, setNewCourse] = useState("");
  const [newSemester, setNewSemester] = useState("1");
  const [newSubject, setNewSubject] = useState("");

  const handleAdd = () => {
    if (!newTitle.trim() || !newCourse || !newSubject.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    const newMaterial: StudyMaterial = {
      id: String(Date.now()),
      title: newTitle,
      type: newType as StudyMaterial['type'],
      course: newCourse,
      semester: Number(newSemester),
      subject: newSubject,
      uploadedAt: new Date().toISOString().split('T')[0],
      fileSize: '0 MB',
      downloadCount: 0,
    };
    setAllMaterials([newMaterial, ...allMaterials]);
    setDialogOpen(false);
    setNewTitle("");
    setNewSubject("");
    toast.success("Material added successfully");
  };

  const handleDelete = (id: string) => {
    setAllMaterials(allMaterials.filter(m => m.id !== id));
    toast.success("Material deleted");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield className="h-5 w-5 text-primary" />
              <h1 className="font-heading font-bold text-xl text-foreground">Admin Panel</h1>
            </div>
            <p className="text-sm text-muted-foreground font-body">Manage study materials and content</p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-primary-foreground font-body gap-1.5">
                <Plus className="h-4 w-4" />
                Add Material
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-heading">Upload New Material</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div>
                  <Label className="font-body text-sm">Title</Label>
                  <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="e.g. Data Structures Notes" className="mt-1 font-body" />
                </div>
                <div>
                  <Label className="font-body text-sm">Type</Label>
                  <Select value={newType} onValueChange={setNewType}>
                    <SelectTrigger className="mt-1 font-body"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="notes">Notes</SelectItem>
                      <SelectItem value="syllabus">Syllabus</SelectItem>
                      <SelectItem value="question-paper">Question Paper</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="font-body text-sm">Course</Label>
                  <Select value={newCourse} onValueChange={setNewCourse}>
                    <SelectTrigger className="mt-1 font-body"><SelectValue placeholder="Select course" /></SelectTrigger>
                    <SelectContent>
                      {courses.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="font-body text-sm">Semester</Label>
                    <Select value={newSemester} onValueChange={setNewSemester}>
                      <SelectTrigger className="mt-1 font-body"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 8 }, (_, i) => (
                          <SelectItem key={i + 1} value={String(i + 1)}>Semester {i + 1}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="font-body text-sm">Subject</Label>
                    <Input value={newSubject} onChange={e => setNewSubject(e.target.value)} placeholder="Subject name" className="mt-1 font-body" />
                  </div>
                </div>
                <Button onClick={handleAdd} className="w-full gradient-primary text-primary-foreground font-body gap-1.5">
                  <Upload className="h-4 w-4" />
                  Upload Material
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Stats */}
        <div className="mb-6">
          <StatsGrid />
        </div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-lg overflow-hidden"
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-heading text-xs">Title</TableHead>
                <TableHead className="font-heading text-xs">Type</TableHead>
                <TableHead className="font-heading text-xs hidden md:table-cell">Course</TableHead>
                <TableHead className="font-heading text-xs hidden sm:table-cell">Sem</TableHead>
                <TableHead className="font-heading text-xs hidden lg:table-cell">Downloads</TableHead>
                <TableHead className="font-heading text-xs w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allMaterials.map((m) => {
                const TypeIcon = typeIcons[m.type];
                return (
                  <TableRow key={m.id}>
                    <TableCell className="font-body text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <TypeIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="truncate max-w-[200px]">{m.title}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-[10px] font-body capitalize">{m.type.replace('-', ' ')}</Badge>
                    </TableCell>
                    <TableCell className="font-body text-xs text-muted-foreground hidden md:table-cell">{m.course}</TableCell>
                    <TableCell className="font-body text-xs hidden sm:table-cell">{m.semester}</TableCell>
                    <TableCell className="font-body text-xs hidden lg:table-cell">{m.downloadCount}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDelete(m.id)}>
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
