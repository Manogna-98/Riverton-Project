// @refresh reset
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabase';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  name: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string, role: string) => Promise<{ success: boolean; error?: string; role?: string }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (session?.user) {
          await fetchAndSetUser(session.user.email || '');
        } else {
          setLoading(false);
        }
      } catch (err: any) {
        console.error("Auth session error:", err);
        // Clear broken session data from local storage
        await supabase.auth.signOut();
        setLoading(false);
      }
    };

    initSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await fetchAndSetUser(session.user.email || '');
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const fetchAndSetUser = async (email: string): Promise<{ success: boolean; error?: string; role?: string }> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .eq('email', email)
        .maybeSingle();

      if (error) {
        console.error("Profile fetch DB error:", error);
        return { success: false, error: "Database error fetching profile." };
      }
      if (!data) {
        return { success: false, error: "Auth succeeded, but no matching Profile was found in the database. Check your 'profiles' table!" };
      }

      const userRole = data.role ? data.role.charAt(0).toUpperCase() + data.role.slice(1) : 'Resident';

      setUser({
        id: data.id.toString(),
        email,
        role: userRole,
        name: data.full_name || 'User',
      });
      return { success: true, role: userRole };
    } catch (err) {
      console.error("Profile fetch error:", err);
      return { success: false, error: "An unexpected error occurred while fetching the profile." };
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string, role: string): Promise<{ success: boolean; error?: string; role?: string }> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error || !data.session) {
      console.error("Supabase Auth Error:", error?.message);
      return { success: false, error: error?.message || "Invalid credentials." };
    }
    const profileResult = await fetchAndSetUser(email); 
    
    // If they authenticated but have no profile in the DB, sign them out to prevent ghost sessions
    if (!profileResult.success) {
      await supabase.auth.signOut();
      return profileResult;
    }

    if (profileResult.role !== role) {
      await logout();
      return { success: false, error: `Access denied. Your account does not have ${role} privileges.` };
    }

    return { success: true };
  };

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.clear();
      sessionStorage.clear();
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
