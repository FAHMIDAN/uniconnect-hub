import { Link, useLocation, useNavigate } from "react-router-dom";
import { GraduationCap, BookOpen, Shield, LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { toast } from "sonner";

export function AppHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, userRole, signOut } = useAuth();
  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
    navigate("/");
  };

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
          {!user && (
            <Button variant={isActive("/") ? "secondary" : "ghost"} size="sm" asChild className="font-body text-xs gap-1.5">
              <Link to="/"><LogIn className="h-3.5 w-3.5" />Login</Link>
            </Button>
          )}
          {user && userRole === "student" && (
            <Button variant={isActive("/dashboard") ? "secondary" : "ghost"} size="sm" asChild className="font-body text-xs gap-1.5">
              <Link to="/dashboard"><BookOpen className="h-3.5 w-3.5" />Materials</Link>
            </Button>
          )}
          {userRole === "admin" && (
            <Button variant={isActive("/admin") ? "secondary" : "ghost"} size="sm" asChild className="font-body text-xs gap-1.5">
              <Link to="/admin"><Shield className="h-3.5 w-3.5" />Admin Panel</Link>
            </Button>
          )}
          {user && (
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="font-body text-xs gap-1.5">
              <LogOut className="h-3.5 w-3.5" />Sign Out
            </Button>
          )}
        </nav>
      </div>
    </motion.header>
  );
}
