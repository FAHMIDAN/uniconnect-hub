import { Link, useLocation } from "react-router-dom";
import { GraduationCap, BookOpen, Shield, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function AppHeader() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-50 border-b border-border bg-card/90 backdrop-blur-md"
    >
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="gradient-primary p-1.5 rounded-lg">
            <GraduationCap className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-heading font-bold text-foreground text-sm">CU StudyHub</span>
        </Link>

        <nav className="flex items-center gap-1">
          <Button
            variant={isActive("/") ? "secondary" : "ghost"}
            size="sm"
            asChild
            className="font-body text-xs gap-1.5"
          >
            <Link to="/"><Home className="h-3.5 w-3.5" />Home</Link>
          </Button>
          <Button
            variant={isActive("/dashboard") ? "secondary" : "ghost"}
            size="sm"
            asChild
            className="font-body text-xs gap-1.5"
          >
            <Link to="/dashboard"><BookOpen className="h-3.5 w-3.5" />Materials</Link>
          </Button>
          <Button
            variant={isActive("/admin") ? "secondary" : "ghost"}
            size="sm"
            asChild
            className="font-body text-xs gap-1.5"
          >
            <Link to="/admin"><Shield className="h-3.5 w-3.5" />Admin</Link>
          </Button>
        </nav>
      </div>
    </motion.header>
  );
}
