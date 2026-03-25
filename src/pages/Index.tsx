import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, LogIn, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const Index = () => {
  const { user, userRole, signIn, signUp } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && userRole) {
      navigate(userRole === "admin" ? "/admin" : "/dashboard", { replace: true });
    }
  }, [user, userRole, navigate]);

  const [tab, setTab] = useState("login");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupLoading, setSignupLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      await signIn(loginEmail, loginPassword);
      toast.success("Welcome back!");
    } catch (err: any) {
      toast.error(err.message || "Login failed");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signupPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setSignupLoading(true);
    try {
      await signUp(signupEmail, signupPassword, signupName);
      toast.success("Account created! You can now sign in.");
      setTab("login");
    } catch (err: any) {
      toast.error(err.message || "Signup failed");
    } finally {
      setSignupLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex gradient-primary p-3 rounded-xl mb-4">
            <GraduationCap className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="font-heading font-bold text-2xl text-foreground">CU StudyHub</h1>
          <p className="text-sm text-muted-foreground font-body mt-1">
            Calicut University Study Materials Portal
          </p>
        </div>

        <div className="glass-card rounded-xl p-6">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="w-full mb-6">
              <TabsTrigger value="login" className="flex-1 font-body gap-1.5 text-xs">
                <LogIn className="h-3.5 w-3.5" /> Login
              </TabsTrigger>
              <TabsTrigger value="signup" className="flex-1 font-body gap-1.5 text-xs">
                <UserPlus className="h-3.5 w-3.5" /> Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label className="font-body text-sm">Email</Label>
                  <Input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="you@example.com" required className="mt-1 font-body" />
                </div>
                <div>
                  <Label className="font-body text-sm">Password</Label>
                  <Input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="••••••••" required className="mt-1 font-body" />
                </div>
                <Button type="submit" disabled={loginLoading} className="w-full gradient-primary text-primary-foreground font-body gap-2">
                  <LogIn className="h-4 w-4" />
                  {loginLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <Label className="font-body text-sm">Full Name</Label>
                  <Input value={signupName} onChange={(e) => setSignupName(e.target.value)} placeholder="John Doe" required className="mt-1 font-body" />
                </div>
                <div>
                  <Label className="font-body text-sm">Email</Label>
                  <Input type="email" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} placeholder="you@example.com" required className="mt-1 font-body" />
                </div>
                <div>
                  <Label className="font-body text-sm">Password</Label>
                  <Input type="password" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} placeholder="Min 6 characters" required className="mt-1 font-body" />
                </div>
                <Button type="submit" disabled={signupLoading} className="w-full gradient-primary text-primary-foreground font-body gap-2">
                  <UserPlus className="h-4 w-4" />
                  {signupLoading ? "Creating account..." : "Sign Up"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

        </div>
      </motion.div>
    </div>
  );
};

export default Index;
