import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/shared/Navbar.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== passwordConfirmation) {
      setError("Las contraseñas no coinciden");
      return;
    }
    setLoading(true);
    try {
      await register(email, password, passwordConfirmation);
      navigate("/app");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="mx-auto flex max-w-md flex-col items-center px-6 py-24 text-center">
        <h1 className="text-2xl font-bold text-navy">Crear cuenta</h1>
        <p className="mt-2 text-slate-500">Regístrate en Kleino</p>

        {error && (
          <div className="mt-4 w-full rounded bg-red-100 p-3 text-sm text-red-700">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 w-full space-y-4">
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded border border-slate-300 px-4 py-2 focus:border-navy focus:outline-none"
          />
          <input
            type="password"
            placeholder="Contraseña (mínimo 8 caracteres)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="w-full rounded border border-slate-300 px-4 py-2 focus:border-navy focus:outline-none"
          />
          <input
            type="password"
            placeholder="Repite tu contraseña"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            required
            minLength={8}
            className="w-full rounded border border-slate-300 px-4 py-2 focus:border-navy focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-navy py-2 text-white hover:bg-navy/90 disabled:opacity-50"
          >
            {loading ? "Creando cuenta..." : "Registrarme"}
          </button>
        </form>

        <p className="mt-4 text-sm text-slate-500">
          ¿Ya tienes cuenta?{" "}
          <a href="/login" className="text-navy hover:underline">Inicia sesión</a>
        </p>
      </main>
    </div>
  );
}
