import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";

const API_URL = import.meta.env.VITE_API_URL;
const FORM_INICIAL = { nombre: "", tipo: "", capacidad: "", ubicacion: "", estado: "activo", sede_id: "" };

export default function Espacios() {
  const { logout } = useAuth();
  const [espacios, setEspacios] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(FORM_INICIAL);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [resEsp, resSedes] = await Promise.all([
        fetch(`${API_URL}/espacios`, { credentials: "include" }),
        fetch(`${API_URL}/sedes`, { credentials: "include" }),
      ]);
      if (!resEsp.ok || !resSedes.ok) throw new Error("No se pudieron cargar los datos");
      setEspacios(await resEsp.json());
      setSedes(await resSedes.json());
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
      const res = await fetch(`${API_URL}/espacios${isEdit ? `/${editingId}` : ""}`, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...form, capacidad: Number(form.capacidad) }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.errors?.join(", ") || "No se pudo guardar el espacio");
      }
      setForm(FORM_INICIAL);
      setEditingId(null);
      await load();
    } catch (e) {
      setFormError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar este espacio?")) return;
    try {
      const res = await fetch(`${API_URL}/espacios/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.errors?.join(", ") || "No se pudo eliminar el espacio");
      }
      await load();
    } catch (e) {
      setFormError(e.message);
    }
  };

  const startEdit = (esp) => {
    setEditingId(esp.id);
    setForm({
      nombre: esp.nombre,
      tipo: esp.tipo,
      capacidad: esp.capacidad,
      ubicacion: esp.ubicacion,
      estado: esp.estado,
      sede_id: String(esp.sede_id),
    });
  };

  const nombreSede = (id) => sedes.find((s) => s.id === id)?.nombre ?? `Sede #${id}`;

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-navy">Espacios</h1>
        <div className="space-x-3 text-sm">
          <a href="/app" className="text-navy hover:underline">Panel</a>
          <a href="/app/sedes" className="text-navy hover:underline">Sedes</a>
          <a href="/app/reservas" className="text-navy hover:underline">Reservas</a>
          <button onClick={logout} className="text-red-600 hover:underline">Cerrar sesión</button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-3 rounded border border-slate-200 p-4 sm:grid-cols-3">
        <input placeholder="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required className="rounded border border-slate-300 px-3 py-2" />
        <input placeholder="Tipo (sala, cancha...)" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} required className="rounded border border-slate-300 px-3 py-2" />
        <input type="number" min="1" placeholder="Capacidad" value={form.capacidad} onChange={(e) => setForm({ ...form, capacidad: e.target.value })} required className="rounded border border-slate-300 px-3 py-2" />
        <input placeholder="Ubicación" value={form.ubicacion} onChange={(e) => setForm({ ...form, ubicacion: e.target.value })} className="rounded border border-slate-300 px-3 py-2" />
        <select value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })} className="rounded border border-slate-300 px-3 py-2">
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
        </select>
        <select value={form.sede_id} onChange={(e) => setForm({ ...form, sede_id: e.target.value })} required className="rounded border border-slate-300 px-3 py-2">
          <option value="">Selecciona una sede</option>
          {sedes.map((s) => (
            <option key={s.id} value={s.id}>{s.nombre}</option>
          ))}
        </select>
        <button type="submit" disabled={saving} className="rounded bg-navy py-2 text-white hover:bg-navy/90 disabled:opacity-50">
          {saving ? "Guardando..." : editingId !== null ? "Actualizar" : "Crear espacio"}
        </button>
        {editingId !== null && (
          <button type="button" onClick={() => { setEditingId(null); setForm(FORM_INICIAL); }} className="text-sm text-slate-500 hover:underline">
            Cancelar edición
          </button>
        )}
      </form>

      {formError && <div className="mt-3 rounded bg-red-100 p-3 text-sm text-red-700">{formError}</div>}

      {loading ? (
        <p className="mt-6 text-slate-500">Cargando espacios...</p>
      ) : error ? (
        <p className="mt-6 rounded bg-red-100 p-3 text-sm text-red-700">{error}</p>
      ) : espacios.length === 0 ? (
        <p className="mt-6 text-slate-500">Aún no hay espacios creados.</p>
      ) : (
        <table className="mt-6 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th className="py-2">Nombre</th>
              <th className="py-2">Sede</th>
              <th className="py-2">Capacidad</th>
              <th className="py-2">Estado</th>
              <th className="py-2 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {espacios.map((esp) => (
              <tr key={esp.id} className="border-b border-slate-100">
                <td className="py-2">{esp.nombre}</td>
                <td className="py-2">{nombreSede(esp.sede_id)}</td>
                <td className="py-2">{esp.capacidad}</td>
                <td className="py-2">{esp.estado}</td>
                <td className="py-2 text-right space-x-2">
                  <button onClick={() => startEdit(esp)} className="text-navy hover:underline">Editar</button>
                  <button onClick={() => handleDelete(esp.id)} className="text-red-600 hover:underline">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
