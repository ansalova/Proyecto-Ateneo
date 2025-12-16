import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const TeacherRoute = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <p>Cargando...</p>;

  if (user && (user.role === "teacher" || user.role === "admin")) {
    return <Outlet />;
  }

  return <Navigate to="/" />;
};

export default TeacherRoute;
