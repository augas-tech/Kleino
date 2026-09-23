import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";

const API_URL = import.meta.env.VITE_API_URL;
const FORM_INICIAL = { espacio_id: "", fecha: "", hora_inicio: "", hora_fin: "" };

export default function Reservas() {
  const { logout } = useAuth();
  const [reservas, setReservas] = useState([]);
  const [espacios, setEspacios] = useState([]);
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
      const [resRes, resEsp] = await Promise.all([
        fetch(`${API_URL}/reservas`, { credentials: "include" }),
        fetch(`${API_URL}/espacios`, { credentials: "include" }),
      ]);
      if (!resRes.ok || !resEsp.ok) throw new Error("No se pudieron cargar los datos");
      setReservas(await resRes.json());
      setEspacios(await resEsp.json());
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
      const res = await fetch(`${API_URL}/reservas${isEdit ? `/${editingId}` : ""}`, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.errors?.join(", ") || "No se pudo guardar la reserva");
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
    if (!window.confirm("¿Seguro que quieres eliminar esta reserva?")) return;
    try {
      const res = await fetch(`${API_URL}/reservas/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.errors?.join(", ") || "No se pudo eliminar la reserva");
      }
      await load();
    } catch (e) {
      setFormError(e.message);
    }
  };

  const startEdit = (reserva) => {
    setEditingId(reserva.id);
    setForm({
      espacio_id: String(reserva.espacio_id),
      fecha: reserva.fecha,
      hora_inicio: reserva.hora_inicio?.slice(0, 5),
      hora_fin: reserva.hora_fin?.slice(0, 5),
    });
  };

  const nombreEspacio = (id) => espacios.find((e) => e.id === id)?.nombre ?? `Espacio #${id}`;

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-navy">Reservas</h1>
        <div className="space-x-3 text-sm">
          <a href="/app" className="text-navy hover:underline">Panel</a>
          <a href="/app/sedes" className="text-navy hover:underline">Sedes</a>
          <a href="/app/espacios" className="text-navy hover:underline">Espacios</a>
          <button onClick={logout} className="text-red-600 hover:underline">Cerrar sesión</button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-3 rounded border border-slate-200 p-4 sm:grid-cols-4">
        <select value={form.espacio_id} onChange={(e) => setForm({ ...form, espacio_id: e.target.value })} required className="rounded border border-slate-300 px-3 py-2">
          <option value="">Selecciona un espacio</option>
          {espacios.map((e) => (
            <option key={e.id} value={e.id}>{e.nombre}</option>
          ))}
        </select>
        <input type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} required className="rounded border border-slate-300 px-3 py-2" />
        <input type="time" value={form.hora_inicio} onChange={(e) => setForm({ ...form, hora_inicio: e.target.value })} required className="rounded border border-slate-300 px-3 py-2" />
        <input type="time" value={form.hora_fin} onChange={(e) => setForm({ ...form, hora_fin: e.target.value })} required className="rounded border border-slate-300 px-3 py-2" />
        <button type="submit" disabled={saving} className="rounded bg-navy py-2 text-white hover:bg-navy/90 disabled:opacity-50">
          {saving ? "Guardando..." : editingId !== null ? "Actualizar" : "Crear reserva"}
        </button>
        {editingId !== null && (
          <button type="button" onClick={() => { setEditingId(null); setForm(FORM_INICIAL); }} className="text-sm text-slate-500 hover:underline">
            Cancelar edición
          </button>
        )}
      </form>

      {formError && (
        <div className="mt-3 rounded bg-red-100 p-3 text-sm text-red-700">
          {formError}
        </div>
      )}

      {loading ? (
        <p className="mt-6 text-slate-500">Cargando reservas...</p>
      ) : error ? (
        <p className="mt-6 rounded bg-red-100 p-3 text-sm text-red-700">{error}</p>
      ) : reservas.length === 0 ? (
        <p className="mt-6 text-slate-500">Aún no hay reservas.</p>
      ) : (
        <table className="mt-6 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th className="py-2">Espacio</th>
              <th className="py-2">Fecha</th>
              <th className="py-2">Horario</th>
              <th className="py-2">Estado</th>
              <th className="py-2 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {reservas.map((r) => (
              <tr key={r.id} className="border-b border-slate-100">
                <td className="py-2">{nombreEspacio(r.espacio_id)}</td>
                <td className="py-2">{r.fecha}</td>
                <td className="py-2">{r.hora_inicio?.slice(0, 5)} - {r.hora_fin?.slice(0, 5)}</td>
                <td className="py-2">{r.estado}</td>
                <td className="py-2 text-right space-x-2">
                  <button onClick={() => startEdit(r)} className="text-navy hover:underline">Editar</button>
                  <button onClick={() => handleDelete(r.id)} className="text-red-600 hover:underline">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
