import { useAuth } from "../context/AuthContext.jsx";

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <main className="mx-auto max-w-3xl px-6 py-24 text-center">
      <h1 className="text-3xl font-bold text-navy">Bienvenido a Kleino</h1>
      <p className="mt-2 text-slate-500">
        Sesión iniciada como <span className="font-semibold">{user?.email_address}</span>
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        <a href="/app/sedes" className="rounded border border-slate-200 p-6 hover:border-navy">
          <h2 className="font-bold text-navy">Sedes</h2>
          <p className="mt-1 text-sm text-slate-500">Crear, editar y eliminar sedes</p>
        </a>
        <a href="/app/espacios" className="rounded border border-slate-200 p-6 hover:border-navy">
          <h2 className="font-bold text-navy">Espacios</h2>
          <p className="mt-1 text-sm text-slate-500">Gestionar espacios por sede</p>
        </a>
        <a href="/app/reservas" className="rounded border border-slate-200 p-6 hover:border-navy">
          <h2 className="font-bold text-navy">Reservas</h2>
          <p className="mt-1 text-sm text-slate-500">Reservar espacios sin cruces de horario</p>
        </a>
      </div>

      <button onClick={logout} className="mt-10 rounded bg-red-600 px-6 py-2 text-white hover:bg-red-700">
        Cerrar sesión
      </button>
    </main>
  );
}