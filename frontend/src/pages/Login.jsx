import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/shared/Navbar.jsx";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // OBLIGATORIO: para que el navegador envíe la cookie de sesión a Rails
        body: JSON.stringify({
          email_address: email, // Rails 8 usa 'email_address' por defecto
          password: password,
        }),
      });

      if (response.ok) {
        // Login exitoso: redirigir al dashboard o página principal
        navigate("/app"); 
      } else {
        const data = await response.json().catch(() => ({}));
        if (response.status === 401) {
          setError("Email o contraseña incorrectos");
        } else if (response.status === 422) {
          setError(data.errors?.join(", ") || "Datos inválidos");
        } else {
          setError("Error al iniciar sesión. Intenta de nuevo.");
        }
      }
    } catch (err) {
      setError("No se pudo conectar con el servidor. Verifica que el backend esté corriendo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="mx-auto flex max-w-md flex-col items-center px-6 py-24 text-center">
        <h1 className="text-2xl font-bold text-navy">Ingresar</h1>
        <p className="mt-2 text-slate-500">Inicia sesión en tu cuenta</p>

        {error && (
          <div className="mt-4 w-full rounded bg-red-100 p-3 text-sm text-red-700">
            {error}
          </div>
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
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded border border-slate-300 px-4 py-2 focus:border-navy focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-navy py-2 text-white hover:bg-navy/90 disabled:opacity-50 transition-colors"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <p className="mt-4 text-sm text-slate-500">
          ¿No tienes cuenta?{" "}
          <a href="/register" className="text-navy hover:underline">
            Regístrate
          </a>
        </p>
      </main>
    </div>
  );
}