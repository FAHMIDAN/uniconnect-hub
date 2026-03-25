import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Shield, Upload, FileText, BookOpen, HelpCircle, Users, Bell, Send, ChevronDown, ChevronRight, Download } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const typeIcons: Record<string, any> = {
  notes: FileText,
  syllabus: BookOpen,
  "question-paper": HelpCircle,
};

interface CourseRow { id: string; name: string; code: string; semesters: number; }
interface MaterialRow { id: string; title: string; type: string; course_id: string; semester: number; subject: string; file_url: string | null; file_size: string | null; download_count: number | null; created_at: string; uploaded_by: string | null; courses?: { name: string } | null; uploader?: { full_name: string | null; email: string | null } | null; }
interface UserRow { user_id: string; full_name: string | null; email: string | null; created_at: string; current_semester: number | null; courses?: { name: string } | null; }
interface AnnouncementRow { id: string; title: string; message: string; course_id: string | null; created_at: string; courses?: { name: string } | null; }

const AdminDashboard = () => {
  const { user, userRole } = useAuth();
  const [tab, setTab] = useState("materials");
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [allMaterials, setAllMaterials] = useState<MaterialRow[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementRow[]>([]);
  const [announcementDialogOpen, setAnnouncementDialogOpen] = useState(false);

  // Upload form per course/semester
  const [uploadTarget, setUploadTarget] = useState<{ courseId: string; semester: number } | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState("notes");
  const [newSubject, setNewSubject] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Collapsible state for courses
  const [openCourses, setOpenCourses] = useState<Record<string, boolean>>({});

  // Announcement form
  const [annTitle, setAnnTitle] = useState("");
  const [annMessage, setAnnMessage] = useState("");
  const [annCourse, setAnnCourse] = useState("all");
  const [annSending, setAnnSending] = useState(false);

  useEffect(() => {
    fetchCourses();
    fetchMaterials();
    fetchUsers();
    fetchAnnouncements();
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
    const { data } = await supabase.from("profiles").select("user_id, full_name, email, created_at, current_semester, courses:course_id(name)").order("created_at", { ascending: false });
    if (data) setUsers(data as any);
  };

  const fetchAnnouncements = async () => {
    const { data } = await supabase.from("announcements").select("*, courses:course_id(name)").order("created_at", { ascending: false });
    if (data) setAnnouncements(data as any);
  };

  const handleUpload = async () => {
    if (!uploadTarget || !newTitle.trim() || !newSubject.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    setUploading(true);

    let fileUrl: string | null = null;
    let fileSize: string | null = null;

    if (selectedFile) {
      const filePath = `${Date.now()}_${selectedFile.name}`;
      const { error: uploadError } = await supabase.storage.from("materials").upload(filePath, selectedFile);
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
      title: newTitle, type: newType, course_id: uploadTarget.courseId, semester: uploadTarget.semester, subject: newSubject, file_url: fileUrl, file_size: fileSize, uploaded_by: user!.id,
    });

    if (error) {
      toast.error("Failed to add material: " + error.message);
    } else {
      toast.success("Material uploaded!");
      setUploadTarget(null);
      setNewTitle(""); setNewSubject(""); setSelectedFile(null); setNewType("notes");
      fetchMaterials();
    }
    setUploading(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("materials").delete().eq("id", id);
    if (error) toast.error("Delete failed");
    else { toast.success("Material deleted"); fetchMaterials(); }
  };

  const handleSendAnnouncement = async () => {
    if (!annTitle.trim() || !annMessage.trim()) {
      toast.error("Please fill in title and message");
      return;
    }
    setAnnSending(true);
    const { error } = await supabase.from("announcements").insert({
      title: annTitle, message: annMessage, course_id: annCourse === "all" ? null : annCourse, created_by: user!.id,
    });
    if (error) {
      toast.error("Failed to send: " + error.message);
    } else {
      toast.success("Announcement sent!");
      setAnnouncementDialogOpen(false);
      setAnnTitle(""); setAnnMessage(""); setAnnCourse("all");
      fetchAnnouncements();
    }
    setAnnSending(false);
  };

  const handleDeleteAnnouncement = async (id: string) => {
    const { error } = await supabase.from("announcements").delete().eq("id", id);
    if (error) toast.error("Delete failed");
    else { toast.success("Deleted"); fetchAnnouncements(); }
  };

  const getMaterialsForCourseSemester = (courseId: string, semester: number) =>
    allMaterials.filter((m) => m.course_id === courseId && m.semester === semester);

  const toggleCourse = (courseId: string) =>
    setOpenCourses((prev) => ({ ...prev, [courseId]: !prev[courseId] }));

  if (userRole !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="font-heading font-bold text-xl text-foreground mb-2">Access Denied</h1>
          <p className="text-sm text-muted-foreground font-body">You need admin privileges.</p>
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
            <p className="text-sm text-muted-foreground font-body">Manage materials, users, and announcements</p>
          </div>
          <Dialog open={announcementDialogOpen} onOpenChange={setAnnouncementDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="font-body gap-1.5">
                <Bell className="h-4 w-4" /> Send Announcement
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader><DialogTitle className="font-heading">Send Announcement</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <div>
                  <Label className="font-body text-sm">Title</Label>
                  <Input value={annTitle} onChange={(e) => setAnnTitle(e.target.value)} placeholder="Announcement title" className="mt-1 font-body" />
                </div>
                <div>
                  <Label className="font-body text-sm">Message</Label>
                  <Textarea value={annMessage} onChange={(e) => setAnnMessage(e.target.value)} placeholder="Write your message..." className="mt-1 font-body" rows={4} />
                </div>
                <div>
                  <Label className="font-body text-sm">Target Course</Label>
                  <Select value={annCourse} onValueChange={setAnnCourse}>
                    <SelectTrigger className="mt-1 font-body"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Courses</SelectItem>
                      {courses.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleSendAnnouncement} disabled={annSending} className="w-full gradient-primary text-primary-foreground font-body gap-1.5">
                  <Send className="h-4 w-4" /> {annSending ? "Sending..." : "Send Announcement"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="glass-card rounded-lg p-4">
            <p className="font-heading font-bold text-xl text-foreground">{allMaterials.length}</p>
            <p className="text-xs text-muted-foreground font-body">Materials</p>
          </div>
          <div className="glass-card rounded-lg p-4">
            <p className="font-heading font-bold text-xl text-foreground">{users.length}</p>
            <p className="text-xs text-muted-foreground font-body">Users</p>
          </div>
          <div className="glass-card rounded-lg p-4">
            <p className="font-heading font-bold text-xl text-foreground">{courses.length}</p>
            <p className="text-xs text-muted-foreground font-body">Courses</p>
          </div>
          <div className="glass-card rounded-lg p-4">
            <p className="font-heading font-bold text-xl text-foreground">{announcements.length}</p>
            <p className="text-xs text-muted-foreground font-body">Announcements</p>
          </div>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="materials" className="font-body gap-1.5"><FileText className="h-3.5 w-3.5" /> Materials</TabsTrigger>
            <TabsTrigger value="users" className="font-body gap-1.5"><Users className="h-3.5 w-3.5" /> Users</TabsTrigger>
            <TabsTrigger value="announcements" className="font-body gap-1.5"><Bell className="h-3.5 w-3.5" /> Announcements</TabsTrigger>
          </TabsList>

          <TabsContent value="materials">
            <div className="space-y-3">
              {courses.map((course) => (
                <Collapsible key={course.id} open={openCourses[course.id]} onOpenChange={() => toggleCourse(course.id)}>
                  <CollapsibleTrigger asChild>
                    <button className="w-full glass-card rounded-lg p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <BookOpen className="h-4 w-4 text-primary" />
                        <div className="text-left">
                          <p className="font-heading font-semibold text-sm text-foreground">{course.name}</p>
                          <p className="text-xs text-muted-foreground font-body">{course.code} • {course.semesters} semesters • {allMaterials.filter(m => m.course_id === course.id).length} materials</p>
                        </div>
                      </div>
                      {openCourses[course.id] ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="ml-4 mt-2 space-y-2">
                      {Array.from({ length: course.semesters }, (_, i) => i + 1).map((sem) => {
                        const semMaterials = getMaterialsForCourseSemester(course.id, sem);
                    console.log(semMaterials,'semMaterials');
                    
                        return (
                          <div key={sem} className="glass-card rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-heading font-medium text-sm text-foreground">Semester {sem}</p>
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-[10px] font-body">{semMaterials.length} files</Badge>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs font-body gap-1"
                                  onClick={() => setUploadTarget({ courseId: course.id, semester: sem })}
                                >
                                  <Plus className="h-3 w-3" /> Upload
                                </Button>
                              </div>
                            </div>
                            {semMaterials.length > 0 && (
                              <div className="space-y-1">
                                {semMaterials.map((m) => {
                                  const TypeIcon = typeIcons[m.type] || FileText;
                                  return (
                                    <div key={m.id} className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-muted/30 transition-colors">
                                      <div className="flex items-center gap-2 min-w-0">
                                        <TypeIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                        <span className="font-body text-xs text-foreground truncate">{m.title}</span>
                                        <Badge variant="secondary" className="text-[9px] font-body capitalize shrink-0">{m.type.replace("-", " ")}</Badge>
                                      </div>
        <div className="flex flex-col gap-1 shrink-0">

                                      <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => handleDelete(m.id)}>
                                        <Trash2 className="h-3 w-3 text-destructive" />
                                      </Button>
                                      <Button
                                                  variant="ghost"
                                                  size="icon"
                                                  className="h-8 w-8"
                                                  onClick={() => {
                                                    if (semMaterials.file_url) {
                                                      window.open(semMaterials.file_url, "_blank");
                                                    } else {
                                                      import("sonner").then(({ toast }) => toast.error("No file available for download"));
                                                    }
                                                  }}
                                                >
                                                  <Download className="h-4 w-4 text-primary" />
                                                </Button>
                                      </div>

                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
              {courses.length === 0 && (
                <div className="text-center py-12 text-muted-foreground font-body">No courses found. Add courses to get started.</div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="users">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-heading text-xs">Name</TableHead>
                    <TableHead className="font-heading text-xs">Email</TableHead>
                    <TableHead className="font-heading text-xs hidden md:table-cell">Course</TableHead>
                    <TableHead className="font-heading text-xs hidden sm:table-cell">Semester</TableHead>
                    <TableHead className="font-heading text-xs hidden sm:table-cell">Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.user_id}>
                      <TableCell className="font-body text-sm font-medium">{u.full_name || "—"}</TableCell>
                      <TableCell className="font-body text-xs text-muted-foreground">{u.email}</TableCell>
                      <TableCell className="font-body text-xs text-muted-foreground hidden md:table-cell">{u.courses?.name || "—"}</TableCell>
                      <TableCell className="font-body text-xs hidden sm:table-cell">{u.current_semester || "—"}</TableCell>
                      <TableCell className="font-body text-xs hidden sm:table-cell">{u.created_at?.split("T")[0]}</TableCell>
                    </TableRow>
                  ))}
                  {users.length === 0 && (
                    <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground font-body">No registered users yet.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </motion.div>
          </TabsContent>

          <TabsContent value="announcements">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-heading text-xs">Title</TableHead>
                    <TableHead className="font-heading text-xs">Message</TableHead>
                    <TableHead className="font-heading text-xs hidden md:table-cell">Course</TableHead>
                    <TableHead className="font-heading text-xs hidden sm:table-cell">Date</TableHead>
                    <TableHead className="font-heading text-xs w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {announcements.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-body text-sm font-medium">{a.title}</TableCell>
                      <TableCell className="font-body text-xs text-muted-foreground max-w-[200px] truncate">{a.message}</TableCell>
                      <TableCell className="font-body text-xs hidden md:table-cell">{a.courses?.name || "All"}</TableCell>
                      <TableCell className="font-body text-xs hidden sm:table-cell">{a.created_at?.split("T")[0]}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDeleteAnnouncement(a.id)}>
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {announcements.length === 0 && (
                    <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground font-body">No announcements yet.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Upload Dialog */}
      <Dialog open={!!uploadTarget} onOpenChange={(open) => { if (!open) setUploadTarget(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">
              Upload to {courses.find(c => c.id === uploadTarget?.courseId)?.name} — Semester {uploadTarget?.semester}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label className="font-body text-sm">Title</Label>
              <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="e.g. Data Structures Notes" className="mt-1 font-body" />
            </div>
            <div className="grid grid-cols-2 gap-3">
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
                <Label className="font-body text-sm">Subject</Label>
                <Input value={newSubject} onChange={(e) => setNewSubject(e.target.value)} placeholder="Subject name" className="mt-1 font-body" />
              </div>
            </div>
            <div>
              <Label className="font-body text-sm">PDF File</Label>
              <Input type="file" accept=".pdf" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} className="mt-1 font-body" />
            </div>
            <Button onClick={handleUpload} disabled={uploading} className="w-full gradient-primary text-primary-foreground font-body gap-1.5">
              <Upload className="h-4 w-4" /> {uploading ? "Uploading..." : "Upload Material"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
