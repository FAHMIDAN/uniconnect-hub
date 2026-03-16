import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Shield, Upload, FileText, BookOpen, HelpCircle, Users, UserX } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const typeIcons: Record<string, any> = {
  notes: FileText,
  syllabus: BookOpen,
  "question-paper": HelpCircle,
};

interface CourseRow {
  id: string;
  name: string;
  code: string;
  semesters: number;
}

interface MaterialRow {
  id: string;
  title: string;
  type: string;
  course_id: string;
  semester: number;
  subject: string;
  file_url: string | null;
  file_size: string | null;
  download_count: number | null;
  created_at: string;
  courses?: { name: string } | null;
}

interface UserRow {
  user_id: string;
  full_name: string | null;
  email: string | null;
  created_at: string;
}

const AdminDashboard = () => {
  const { userRole } = useAuth();
  const [tab, setTab] = useState("materials");
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [allMaterials, setAllMaterials] = useState<MaterialRow[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState("notes");
  const [newCourse, setNewCourse] = useState("");
  const [newSemester, setNewSemester] = useState("1");
  const [newSubject, setNewSubject] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchCourses();
    fetchMaterials();
    fetchUsers();
  }, []);

  const fetchCourses = async () => {
    const { data } = await supabase.from("courses").select("*").order("name");
    if (data) setCourses(data);
  };

  const fetchMaterials = async () => {
    const { data } = await supabase.from("materials").select("*, courses(name)").order("created_at", { ascending: false });
    if (data) setAllMaterials(data as any);
  };

  const fetchUsers = async () => {
    const { data } = await supabase.from("profiles").select("user_id, full_name, email, created_at").order("created_at", { ascending: false });
    if (data) setUsers(data);
  };

  const handleAdd = async () => {
    if (!newTitle.trim() || !newCourse || !newSubject.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    setUploading(true);

    let fileUrl: string | null = null;
    let fileSize: string | null = null;

    if (selectedFile) {
      const filePath = `${Date.now()}_${selectedFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("materials")
        .upload(filePath, selectedFile);

      if (uploadError) {
        toast.error("File upload failed: " + uploadError.message);
        setUploading(false);
        return;
      }

      const { data: urlData } = supabase.storage.from("materials").getPublicUrl(filePath);
      fileUrl = urlData.publicUrl;
      fileSize = `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`;
    }

    const { error } = await supabase.from("materials").insert({
      title: newTitle,
      type: newType,
      course_id: newCourse,
      semester: Number(newSemester),
      subject: newSubject,
      file_url: fileUrl,
      file_size: fileSize,
    });

    if (error) {
      toast.error("Failed to add material: " + error.message);
    } else {
      toast.success("Material added successfully");
      setDialogOpen(false);
      setNewTitle("");
      setNewSubject("");
      setSelectedFile(null);
      fetchMaterials();
    }
    setUploading(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("materials").delete().eq("id", id);
    if (error) {
      toast.error("Delete failed");
    } else {
      toast.success("Material deleted");
      fetchMaterials();
    }
  };

  const handleDeleteUser = async (userId: string) => {
    toast.info("User deletion requires server-side admin access");
  };

  if (userRole !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="font-heading font-bold text-xl text-foreground mb-2">Access Denied</h1>
          <p className="text-sm text-muted-foreground font-body">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield className="h-5 w-5 text-primary" />
              <h1 className="font-heading font-bold text-xl text-foreground">Admin Panel</h1>
            </div>
            <p className="text-sm text-muted-foreground font-body">Manage materials, users, and content</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-primary-foreground font-body gap-1.5">
                <Plus className="h-4 w-4" /> Add Material
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-heading">Upload New Material</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div>
                  <Label className="font-body text-sm">Title</Label>
                  <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="e.g. Data Structures Notes" className="mt-1 font-body" />
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
                      {courses.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
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
                    <Input value={newSubject} onChange={(e) => setNewSubject(e.target.value)} placeholder="Subject name" className="mt-1 font-body" />
                  </div>
                </div>
                <div>
                  <Label className="font-body text-sm">PDF File</Label>
                  <Input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="mt-1 font-body"
                  />
                </div>
                <Button onClick={handleAdd} disabled={uploading} className="w-full gradient-primary text-primary-foreground font-body gap-1.5">
                  <Upload className="h-4 w-4" />
                  {uploading ? "Uploading..." : "Upload Material"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Stats summary */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="glass-card rounded-lg p-4">
            <p className="font-heading font-bold text-xl text-foreground">{allMaterials.length}</p>
            <p className="text-xs text-muted-foreground font-body">Materials</p>
          </div>
          <div className="glass-card rounded-lg p-4">
            <p className="font-heading font-bold text-xl text-foreground">{users.length}</p>
            <p className="text-xs text-muted-foreground font-body">Registered Users</p>
          </div>
          <div className="glass-card rounded-lg p-4">
            <p className="font-heading font-bold text-xl text-foreground">{courses.length}</p>
            <p className="text-xs text-muted-foreground font-body">Courses</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="materials" className="font-body gap-1.5">
              <FileText className="h-3.5 w-3.5" /> Materials
            </TabsTrigger>
            <TabsTrigger value="users" className="font-body gap-1.5">
              <Users className="h-3.5 w-3.5" /> Users
            </TabsTrigger>
          </TabsList>

          <TabsContent value="materials">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-lg overflow-hidden">
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
                    const TypeIcon = typeIcons[m.type] || FileText;
                    return (
                      <TableRow key={m.id}>
                        <TableCell className="font-body text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <TypeIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span className="truncate max-w-[200px]">{m.title}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-[10px] font-body capitalize">{m.type.replace("-", " ")}</Badge>
                        </TableCell>
                        <TableCell className="font-body text-xs text-muted-foreground hidden md:table-cell">{m.courses?.name}</TableCell>
                        <TableCell className="font-body text-xs hidden sm:table-cell">{m.semester}</TableCell>
                        <TableCell className="font-body text-xs hidden lg:table-cell">{m.download_count}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDelete(m.id)}>
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {allMaterials.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground font-body">No materials yet. Add your first one!</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </motion.div>
          </TabsContent>

          <TabsContent value="users">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-heading text-xs">Name</TableHead>
                    <TableHead className="font-heading text-xs">Email</TableHead>
                    <TableHead className="font-heading text-xs hidden sm:table-cell">Joined</TableHead>
                    <TableHead className="font-heading text-xs w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.user_id}>
                      <TableCell className="font-body text-sm font-medium">{u.full_name || "—"}</TableCell>
                      <TableCell className="font-body text-xs text-muted-foreground">{u.email}</TableCell>
                      <TableCell className="font-body text-xs hidden sm:table-cell">{u.created_at?.split("T")[0]}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDeleteUser(u.user_id)}>
                          <UserX className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {users.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground font-body">No registered users yet.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
