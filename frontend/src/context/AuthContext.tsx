import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api } from "../services/api";
import type { User } from "../types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (data: {
    username: string;
    email: string;
    password: string;
    password2: string;
    role: "admin" | "teacher" | "student";
  }) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("access_token");
      if (token) {
        try {
          const userData = await api.getProfile();
          setUser(userData);
        } catch (error) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (username: string, password: string) => {
    const response = await api.login(username, password);
    localStorage.setItem("access_token", response.access);
    localStorage.setItem("refresh_token", response.refresh);
    setUser(response.user);
    // 返回Promise，确保状态更新后再resolve
    return new Promise<void>((resolve) => {
      // 使用setTimeout确保状态更新完成
      setTimeout(() => resolve(), 0);
    });
  };

  const register = async (data: {
    username: string;
    email: string;
    password: string;
    password2: string;
    role: "admin" | "teacher" | "student";
  }) => {
    const response = await api.register(data);
    localStorage.setItem("access_token", response.access);
    localStorage.setItem("refresh_token", response.refresh);
    setUser(response.user);
    // 返回Promise，确保状态更新后再resolve
    return new Promise<void>((resolve) => {
      // 使用setTimeout确保状态更新完成
      setTimeout(() => resolve(), 0);
    });
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

