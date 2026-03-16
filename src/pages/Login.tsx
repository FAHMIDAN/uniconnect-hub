import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, LogIn } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Login failed");
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
          <div className="inline-flex gradient-primary p-3 rounded-xl mb-4">
            <GraduationCap className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="font-heading font-bold text-2xl text-foreground">Welcome back</h1>
          <p className="text-sm text-muted-foreground font-body mt-1">Sign in to CU StudyHub</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card rounded-xl p-6 space-y-4">
          <div>
            <Label className="font-body text-sm">Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="mt-1 font-body"
            />
          </div>
          <div>
            <Label className="font-body text-sm">Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="mt-1 font-body"
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full gradient-primary text-primary-foreground font-body gap-2">
            <LogIn className="h-4 w-4" />
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground font-body mt-4">
          Don't have an account?{" "}
          <Link to="/signup" className="text-primary font-medium hover:underline">Sign up</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
