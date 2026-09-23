import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ children }) {
  const { user, checking } = useAuth();

  if (checking) {
    return <p className="py-24 text-center text-slate-500">Cargando sesión...</p>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
