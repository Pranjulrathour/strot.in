import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { User } from "@shared/schema";
import { supabase } from "./supabase";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; phone?: string; email: string; password: string; role: string; locality?: string; location?: string; latitude?: number | null; longitude?: number | null }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const root = document.documentElement;
    if (!user?.role) {
      root.removeAttribute("data-role-theme");
      return;
    }

    const roleTheme =
      user.role === "BUSINESS"
        ? "business"
        : user.role === "COMMUNITY_HEAD"
          ? "community_head"
          : user.role === "DONOR"
            ? "donor"
            : null;

    if (roleTheme) {
      root.setAttribute("data-role-theme", roleTheme);
    } else {
      root.removeAttribute("data-role-theme");
    }
  }, [user?.role]);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        setUser(null);
        return;
      }

      const { data: profile, error: profileErr } = await supabase
        .from("profiles")
        .select("id, role, name, phone, email, created_at")
        .eq("id", session.user.id)
        .maybeSingle();

      if (profileErr) {
        console.warn("Profile fetch failed:", profileErr);
        await new Promise((r) => setTimeout(r, 300));
        const { data: retryProfile, error: retryErr } = await supabase
          .from("profiles")
          .select("id, role, name, phone, email, created_at")
          .eq("id", session.user.id)
          .maybeSingle();

        if (retryErr) {
          throw new Error(retryErr.message);
        }

        if (retryProfile) {
          setUser({
            id: retryProfile.id,
            role: retryProfile.role as any,
            name: retryProfile.name,
            phone: retryProfile.phone ?? "",
            email: retryProfile.email ?? null,
            password: "",
            createdAt: new Date(retryProfile.created_at),
          } as unknown as User);
          return;
        }
      }

      if (!profile) {
        const meta = (session.user.user_metadata ?? {}) as Record<string, unknown>;
        setUser({
          id: session.user.id,
          role: (meta.role as any) ?? ("DONOR" as any),
          name: (meta.name as string) ?? session.user.email ?? "",
          phone: (meta.phone as string) ?? "",
          email: session.user.email ?? null,
          password: "",
          createdAt: new Date(session.user.created_at ?? new Date().toISOString()),
        } as unknown as User);
        return;
      }

      setUser({
        id: profile.id,
        role: profile.role as any,
        name: profile.name,
        phone: profile.phone ?? "",
        email: profile.email ?? null,
        password: "",
        createdAt: new Date(profile.created_at),
      } as unknown as User);
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      checkAuth();
    });
    return () => subscription.unsubscribe();
  }, []);

  async function login(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      throw new Error(error.message || "Login failed");
    }
    const isSuperAdminEmail = email.toLowerCase() === "strotadmin@gmail.com";
    if (isSuperAdminEmail) {
      await new Promise((r) => setTimeout(r, 500));
    }

    await checkAuth();
  }

  async function register(data: { name: string; phone?: string; email: string; password: string; role: string; locality?: string; location?: string; latitude?: number | null; longitude?: number | null }) {
    const { data: signUpData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
          role: data.role,
          phone: data.phone ?? null,
          locality: data.locality ?? null,
          location: data.location ?? null,
          latitude: data.latitude ?? null,
          longitude: data.longitude ?? null,
        },
      },
    });

    if (error) {
      throw new Error(error.message || "Registration failed");
    }

    const userId = signUpData.user?.id;
    if (!userId) {
      throw new Error("Registration failed");
    }

    const hasSession = !!signUpData.session;
    if (!hasSession) {
      return;
    }

    const isSuperAdminEmail = data.email.toLowerCase() === "strotadmin@gmail.com";

    const { error: profileError } = await supabase.from("profiles").upsert(
      isSuperAdminEmail
        ? {
            id: userId,
            name: data.name,
            phone: data.phone ?? null,
            email: data.email,
            location: data.location ?? null,
            latitude: data.latitude ?? null,
            longitude: data.longitude ?? null,
          }
        : {
            id: userId,
            role: data.role,
            name: data.name,
            phone: data.phone ?? null,
            email: data.email,
            location: data.location ?? null,
            latitude: data.latitude ?? null,
            longitude: data.longitude ?? null,
          }
    );
    if (profileError) {
      console.warn("Profile upsert failed:", profileError);
    }

    if (isSuperAdminEmail) {
      await new Promise((r) => setTimeout(r, 500));
    }
    await checkAuth();
  }

  async function logout() {
    await supabase.auth.signOut();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
