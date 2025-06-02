import React from 'react';
import { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(localStorage.getItem("isAuthenticated") === "true");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

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
    // Navigate to login page after logout
    navigate('/login');
  };

  // Function to check authentication status
  const checkAuth = async () => {
    // If already authenticated based on localStorage, return true immediately
    // This prevents unnecessary API calls and infinite loops
    if (localStorage.getItem("isAuthenticated") === "true") {
      return true;
    }
    
    // Only set loading if not already loading
    if (!isLoading) {
      setIsLoading(true);
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/`, {
        credentials: 'include',
      });
      const data = await response.json();
      const isAuth = response.ok && data.isAuthenticated;
      
      // Only update state if it's different from current state
      // This prevents unnecessary re-renders
      if (isAuth !== isAuthenticated) {
        setIsAuthenticated(isAuth);
        if (isAuth) {
          localStorage.setItem("isAuthenticated", "true");
        } else {
          localStorage.removeItem("isAuthenticated");
        }
      }
      
      return isAuth;
    } catch (error) {
      // Only update state if currently authenticated
      // This prevents unnecessary re-renders
      if (isAuthenticated) {
        setIsAuthenticated(false);
        localStorage.removeItem("isAuthenticated");
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Check authentication status on mount - but only if not already authenticated
  // This prevents unnecessary API calls that could cause infinite loops
  React.useEffect(() => {
    if (localStorage.getItem("isAuthenticated") !== "true") {
      checkAuth();
    }
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout, checkAuth }}>
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