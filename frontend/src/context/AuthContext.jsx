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

    const interceptorId = API.interceptors.response.use(
      (response) => response,
      (error) => {
        const status = error?.response?.status;
        if (status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          delete API.defaults.headers.common["Authorization"];
          setUser(null);
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }
    );

    return () => {
      API.interceptors.response.eject(interceptorId);
    };
  }, []);

  const login = async ({ email, password }) => {
    try {
      const { data } = await API.post("/api/auth/login", { email, password });
      
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      API.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
      setUser(data.user);
      return { success: true, user: data.user };
    } catch (err) {
      console.error('Login error:', err);
      
      // Mensajes de error más específicos
      if (err.code === 'ECONNREFUSED' || err.code === 'ERR_NETWORK') {
        return { success: false, message: `Error de conexión con el servidor (${API.defaults.baseURL}). Verifica tu conexión o el estado del backend.` };
      }
      
      if (err.response?.status === 0 || !err.response) {
        return { success: false, message: "Error de conectividad. Verifica la configuración del servidor." };
      }
      
      return { success: false, message: err.response?.data?.msg || err.message || "No se pudo conectar al servidor." };
    }
  };

  const register = async ({ name, email, password, role, documentType, documentNumber, inviteCode }) => {
    try {
      const { data } = await API.post("/api/auth/register", { name, email, password, role, documentType, documentNumber, inviteCode });
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.msg || "No se pudo conectar al servidor." };
    }
  };

  const updateProfile = async (updates) => {
    try {
      const { data } = await API.patch('/api/auth/profile', updates);
      if (data.user) {
        // update local storage and context user
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
      }
      return { success: true, msg: data.msg, user: data.user };
    } catch (err) {
      return { success: false, message: err.response?.data?.msg || 'Error actualizando perfil' };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete API.defaults.headers.common["Authorization"];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, updateProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
