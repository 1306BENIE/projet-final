import React, { useState, useEffect } from "react";
import type { User, RegisterFormValues } from "../interfaces/auth";
import {
  register as registerUser,
  login as loginUser,
  logout as logoutUser,
} from "../services/authService";
import { AuthContext } from "./AuthContext";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    !!localStorage.getItem("token")
  );
  const [user, setUser] = useState<User | null>(
    JSON.parse(localStorage.getItem("user") || "null")
  );

  useEffect(() => {
    if (isAuthenticated && user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [isAuthenticated, user]);

  const login = async (email: string, password: string) => {
    try {
      const response = await loginUser({ email, password });
      const userWithToken = { ...response.user, token: response.token };
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(userWithToken));
      setUser(userWithToken);
      setIsAuthenticated(true);
      return true;
    } catch {
      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return false;
    }
  };

  const register = async (data: RegisterFormValues) => {
    try {
      await registerUser(data);
      return await login(data.email, data.password);
    } catch {
      return false;
    }
  };

  const logout = () => {
    logoutUser();
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
