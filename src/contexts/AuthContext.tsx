import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userRole: "admin" | "student" | null;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<"admin" | "student" | null>(null);

  const fetchRole = async (userId: string) => {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    if (error) {
      setUserRole("student");
      return;
    }

    const roles = data?.map(({ role }) => role) ?? [];
    if (roles.includes("admin")) {
      setUserRole("admin");
      return;
    }

    setUserRole("student");
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          setTimeout(() => fetchRole(session.user.id), 0);
        } else {
          setUserRole(null);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchRole(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    // 1. കർശനമായ വാലിഡേഷൻ: അക്ഷരങ്ങളും സ്പേസും മാത്രമാണോ എന്ന് പരിശോധിക്കുന്നു
    const nameRegex = /^[A-Za-z\s]+$/;

    if (!fullName || !fullName.trim()) {
      throw new Error("Please enter your full name.");
    }

    if (!nameRegex.test(fullName.trim())) {
      // നമ്പറോ സ്പെഷ്യൽ ക്യാരക്ടറോ ഉണ്ടെങ്കിൽ ഇവിടെ വച്ച് എറർ ത്രോ ചെയ്യും.
      // ഇത് താഴെയുള്ള Supabase.auth.signUp ലോജിക്കിലേക്ക് ഡാറ്റയെ കടത്തിവിടില്ല!
      throw new Error("Numbers and Special characters are strictly not allowed in Full Name!");
    }

    // 2. വാലിഡേഷൻ പാസ്സായാൽ മാത്രം Supabase-ലേക്ക് അയക്കുന്നു
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName.trim() } },
    });
    
    if (error) throw error;
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, userRole, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
