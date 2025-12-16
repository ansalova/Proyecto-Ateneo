import React, { createContext, useState, useEffect } from "react";
import API from "../services/api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (savedUser && token) {
        setUser(JSON.parse(savedUser));
        API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  const login = async ({ email, password }) => {
    try {
      const { data } = await API.post("/api/auth/login", { email, password });
      
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      API.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
      setUser(data.user);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.msg || "No se pudo conectar al servidor." };
    }
  };

  const register = async ({ name, email, password, role }) => {
    try {
      const { data } = await API.post("/api/auth/register", { name, email, password, role });
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.msg || "No se pudo conectar al servidor." };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete API.defaults.headers.common["Authorization"];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
