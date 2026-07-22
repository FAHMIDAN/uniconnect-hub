import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { GraduationCap, BookOpen, Shield, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { toast } from "sonner";

export function AppHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, userRole, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
    setMenuOpen(false);
    navigate("/");
  };

  const showStudentLink = user && userRole === "student";
  const showAdminLink = userRole === "admin";
  const hasNav = user;

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-50 border-b border-border bg-card/90 backdrop-blur-md"
    >
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-2">
        <Link to="/" className="flex items-center gap-2 min-w-0" onClick={() => setMenuOpen(false)}>
          <div className="gradient-primary p-1.5 rounded-lg shrink-0">
            <GraduationCap className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-heading font-bold text-foreground text-sm truncate">SSC STUDY HUB</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-1">
          {showStudentLink && (
            <Button variant={isActive("/dashboard") ? "secondary" : "ghost"} size="sm" asChild className="font-body text-xs gap-1.5">
              <Link to="/dashboard"><BookOpen className="h-3.5 w-3.5" />Materials</Link>
            </Button>
          )}
          {showAdminLink && (
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

        {/* Mobile menu trigger */}
        {hasNav && (
          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden h-9 w-9"
            aria-label="Toggle menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        )}
      </div>

      {/* Mobile dropdown panel */}
      {hasNav && menuOpen && (
        <div className="sm:hidden border-t border-border bg-card">
          <nav className="max-w-6xl mx-auto px-4 py-2 flex flex-col gap-1">
            {showStudentLink && (
              <Button variant={isActive("/dashboard") ? "secondary" : "ghost"} size="sm" asChild className="font-body text-xs gap-1.5 justify-start w-full">
                <Link to="/dashboard" onClick={() => setMenuOpen(false)}><BookOpen className="h-3.5 w-3.5" />Materials</Link>
              </Button>
            )}
            {showAdminLink && (
              <Button variant={isActive("/admin") ? "secondary" : "ghost"} size="sm" asChild className="font-body text-xs gap-1.5 justify-start w-full">
                <Link to="/admin" onClick={() => setMenuOpen(false)}><Shield className="h-3.5 w-3.5" />Admin Panel</Link>
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="font-body text-xs gap-1.5 justify-start w-full">
              <LogOut className="h-3.5 w-3.5" />Sign Out
            </Button>
          </nav>
        </div>
      )}
    </motion.header>
  );
}
