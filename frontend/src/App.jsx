import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Sedes from "./pages/Sedes.jsx";
import Espacios from "./pages/Espacios.jsx";
import Reservas from "./pages/Reservas.jsx";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/sedes"
          element={
            <ProtectedRoute>
              <Sedes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/espacios"
          element={
            <ProtectedRoute>
              <Espacios />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/reservas"
          element={
            <ProtectedRoute>
              <Reservas />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}
