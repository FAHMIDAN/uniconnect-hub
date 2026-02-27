import { Link } from "react-router-dom";
import { GraduationCap, BookOpen, FileText, HelpCircle, ArrowRight, Search, Download, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { courses } from "@/lib/data";
import { motion } from "framer-motion";

const features = [
  { icon: Search, title: "Smart Search", desc: "Find materials instantly by course, semester, or subject" },
  { icon: Download, title: "Download & Save", desc: "Download PDFs for offline access anytime" },
  { icon: BookOpen, title: "Organized Content", desc: "Course-wise and semester-wise verified materials" },
  { icon: Wifi, title: "Always Updated", desc: "Latest syllabus and question papers added regularly" },
];

const materialTypes = [
  { icon: FileText, label: "Notes", count: "50+", color: "text-primary bg-primary/10" },
  { icon: BookOpen, label: "Syllabus", count: "30+", color: "text-accent bg-accent/10" },
  { icon: HelpCircle, label: "Question Papers", count: "80+", color: "text-success bg-success/10" },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="gradient-hero text-primary-foreground">
        <div className="max-w-5xl mx-auto px-4 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 rounded-full px-4 py-1.5 mb-6">
              <GraduationCap className="h-4 w-4" />
              <span className="text-xs font-body font-medium">Calicut University Study Hub</span>
            </div>
            <h1 className="font-heading font-bold text-3xl md:text-5xl leading-tight mb-4">
              All your study materials,{" "}
              <span className="text-accent">one place.</span>
            </h1>
            <p className="font-body text-sm md:text-base text-primary-foreground/80 mb-8 max-w-lg mx-auto">
              Access verified notes, syllabus, and question papers for all Calicut University courses. 
              No more hunting across websites.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button asChild size="lg" className="gradient-accent text-accent-foreground font-body font-semibold gap-2 px-6">
                <Link to="/dashboard">
                  Browse Materials <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="font-body border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                <Link to="/admin">Admin Panel</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Material Types */}
      <section className="max-w-5xl mx-auto px-4 -mt-8">
        <div className="grid grid-cols-3 gap-3">
          {materialTypes.map((t, i) => (
            <motion.div
              key={t.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
              className="glass-card rounded-lg p-4 text-center"
            >
              <div className={`inline-flex p-2 rounded-lg mb-2 ${t.color}`}>
                <t.icon className="h-5 w-5" />
              </div>
              <p className="font-heading font-bold text-lg text-foreground">{t.count}</p>
              <p className="text-xs text-muted-foreground font-body">{t.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="font-heading font-bold text-2xl text-foreground mb-2">Why CU StudyHub?</h2>
          <p className="font-body text-sm text-muted-foreground">Everything students need, nothing they don't</p>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card rounded-lg p-5"
            >
              <div className="bg-primary/10 text-primary p-2 rounded-lg w-fit mb-3">
                <f.icon className="h-4 w-4" />
              </div>
              <h3 className="font-heading font-semibold text-sm text-foreground mb-1">{f.title}</h3>
              <p className="font-body text-xs text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Courses */}
      <section className="max-w-5xl mx-auto px-4 pb-16">
        <h2 className="font-heading font-bold text-xl text-foreground mb-4">Available Courses</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {courses.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to="/dashboard"
                className="glass-card rounded-lg p-4 flex items-center justify-between group hover:shadow-md transition-all"
              >
                <div>
                  <p className="font-heading font-semibold text-sm text-foreground">{c.name}</p>
                  <p className="text-xs text-muted-foreground font-body">{c.semesters} Semesters • {c.code}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50">
        <div className="max-w-5xl mx-auto px-4 py-6 text-center">
          <p className="font-body text-xs text-muted-foreground">
            © 2026 CU StudyHub — Built for Calicut University Students
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
