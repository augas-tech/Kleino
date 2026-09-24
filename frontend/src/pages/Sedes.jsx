import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";

const API_URL = import.meta.env.VITE_API_URL;

export default function Sedes() {
  const { logout } = useAuth();
  const [sedes, setSedes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ nombre: "", direccion: "" });
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/sedes`, { credentials: "include" });
      if (!res.ok) throw new Error("No se pudieron cargar las sedes");
      setSedes(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      const isEdit = editingId !== null;
      const res = await fetch(`${API_URL}/sedes${isEdit ? `/${editingId}` : ""}`, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.errors?.join(", ") || "No se pudo guardar la sede");
      }
      setForm({ nombre: "", direccion: "" });
      setEditingId(null);
      await load();
    } catch (e) {
      setFormError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar esta sede?")) return;
    try {
      const res = await fetch(`${API_URL}/sedes/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.errors?.join(", ") || "No se pudo eliminar la sede");
      }
      await load();
    } catch (e) {
      setFormError(e.message);
    }
  };

  const startEdit = (sede) => {
    setEditingId(sede.id);
    setForm({ nombre: sede.nombre, direccion: sede.direccion });
  };

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-navy">Sedes</h1>
        <div className="space-x-3 text-sm">
          <a href="/app" className="text-navy hover:underline">Panel</a>
          <a href="/app/espacios" className="text-navy hover:underline">Espacios</a>
          <a href="/app/reservas" className="text-navy hover:underline">Reservas</a>
          <button onClick={logout} className="text-red-600 hover:underline">Cerrar sesión</button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-3 rounded border border-slate-200 p-4 sm:grid-cols-3">
        <input
          placeholder="Nombre de la sede"
          value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          required
          className="rounded border border-slate-300 px-3 py-2"
        />
        <input
          placeholder="Dirección"
          value={form.direccion}
          onChange={(e) => setForm({ ...form, direccion: e.target.value })}
          required
          className="rounded border border-slate-300 px-3 py-2"
        />
        <button
          type="submit"
          disabled={saving}
          className="rounded bg-navy py-2 text-white hover:bg-navy/90 disabled:opacity-50"
        >
          {saving ? "Guardando..." : editingId !== null ? "Actualizar" : "Crear sede"}
        </button>
        {editingId !== null && (
          <button
            type="button"
            onClick={() => { setEditingId(null); setForm({ nombre: "", direccion: "" }); }}
            className="text-sm text-slate-500 hover:underline"
          >
            Cancelar edición
          </button>
        )}
      </form>

      {formError && <div className="mt-3 rounded bg-red-100 p-3 text-sm text-red-700">{formError}</div>}

      {loading ? (
        <p className="mt-6 text-slate-500">Cargando sedes...</p>
      ) : error ? (
        <p className="mt-6 rounded bg-red-100 p-3 text-sm text-red-700">{error}</p>
      ) : sedes.length === 0 ? (
        <p className="mt-6 text-slate-500">Aún no hay sedes creadas.</p>
      ) : (
        <table className="mt-6 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th className="py-2">Nombre</th>
              <th className="py-2">Dirección</th>
              <th className="py-2 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sedes.map((sede) => (
              <tr key={sede.id} className="border-b border-slate-100">
                <td className="py-2">{sede.nombre}</td>
                <td className="py-2">{sede.direccion}</td>
                <td className="py-2 text-right space-x-2">
                  <button onClick={() => startEdit(sede)} className="text-navy hover:underline">Editar</button>
                  <button onClick={() => handleDelete(sede.id)} className="text-red-600 hover:underline">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
