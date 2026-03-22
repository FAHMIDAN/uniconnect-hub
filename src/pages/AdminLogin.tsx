import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const AdminLogin = () => {
  const { user, userRole, signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && userRole === "admin") {
      navigate("/admin", { replace: true });
    } else if (user && userRole === "student") {
      navigate("/dashboard", { replace: true });
    }
  }, [user, userRole, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const normalizedEmail = email.trim().toLowerCase() === "admin" ? "admin@studyhub.com" : email.trim();
      await signIn(normalizedEmail, password);
      toast.success("Welcome, Admin!");
    } catch (err: any) {
      toast.error(err.message || "Admin login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <div className="inline-flex bg-destructive/10 p-3 rounded-xl mb-4">
            <Shield className="h-7 w-7 text-destructive" />
          </div>
          <h1 className="font-heading font-bold text-2xl text-foreground">Admin Login</h1>
          <p className="text-sm text-muted-foreground font-body mt-1">
            CU StudyHub — Administrative Access
          </p>
        </div>

        <div className="glass-card rounded-xl p-6">
          <div className="bg-muted/50 rounded-lg p-3 mb-4">
            <p className="text-xs text-muted-foreground font-body">
              <Shield className="h-3 w-3 inline mr-1" />
              This area is restricted to authorized administrators only.
            </p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label className="font-body text-sm">Admin Email</Label>
                  <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin or admin@studyhub.com" required className="mt-1 font-body" />
            </div>
            <div>
              <Label className="font-body text-sm">Password</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="mt-1 font-body" />
            </div>
            <Button type="submit" disabled={loading} className="w-full gradient-primary text-primary-foreground font-body gap-2">
              <Shield className="h-4 w-4" />
              {loading ? "Signing in..." : "Admin Sign In"}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
