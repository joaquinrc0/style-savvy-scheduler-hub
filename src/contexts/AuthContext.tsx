import React from 'react';
import { createContext, useContext, useState, ReactNode } from 'react';
import { API_BASE_URL } from '../config';
import { toast } from "@/components/ui/use-toast";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        let errorMsg = 'Login failed';
        try {
          const errData = await response.json();
          errorMsg = errData.error || errorMsg;
        } catch {}
        toast({ title: "Login failed", description: errorMsg, variant: "destructive" });
        throw new Error(errorMsg);
      }
      const data = await response.json();
      if (!data.success) {
        toast({ title: "Login failed", description: data.error || 'Login failed', variant: "destructive" });
        throw new Error(data.error || 'Login failed');
      }
      // Verify session with backend
      const userRes = await fetch(`${API_BASE_URL}/api/user/`, { credentials: 'include' });
      if (userRes.ok) {
        setIsAuthenticated(true);
        localStorage.setItem("isAuthenticated", "true");
        toast({ title: "Login successful", description: "Welcome!", variant: "default" });
      } else {
        setIsAuthenticated(false);
        localStorage.removeItem("isAuthenticated");
        toast({ title: "Login failed", description: "Session could not be established.", variant: "destructive" });
        throw new Error("Session could not be established.");
      }
    } catch (error: any) {
      setIsAuthenticated(false);
      localStorage.removeItem("isAuthenticated");
      toast({ title: "Login failed", description: error?.message || String(error), variant: "destructive" });
      throw error;
    }
  };


  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/logout/`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch {}
    setIsAuthenticated(false);
    localStorage.removeItem("isAuthenticated");
    toast({ title: "Logged out", description: "You have been logged out.", variant: "default" });
  };

  // Check authentication status on mount
  React.useEffect(() => {
    // On mount, check backend session if localStorage says authenticated
    const checkAuth = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/user/`, {
          credentials: 'include',
        });
        const data = await response.json();
        if (response.ok && data.isAuthenticated) {
          setIsAuthenticated(true);
          localStorage.setItem("isAuthenticated", "true");
        } else {
          setIsAuthenticated(false);
          localStorage.removeItem("isAuthenticated");
        }
      } catch {
        setIsAuthenticated(false);
        localStorage.removeItem("isAuthenticated");
      }
    };
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};