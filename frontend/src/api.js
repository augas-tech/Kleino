const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

// Wrapper mínimo sobre fetch. `credentials: "include"` es obligatorio:
// la autenticación del backend usa cookie de sesión (httponly), no un
// token que nosotros manejemos a mano.
async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  // Algunas respuestas no traen cuerpo (204 No Content en destroy/logout).
  const isJson = res.headers.get("content-type")?.includes("application/json");
  const body = isJson ? await res.json() : null;

  if (!res.ok) {
    // El backend responde 422 con { errors: [...] } (array de mensajes),
    // o 401/404/429 con { error: "..." } (string único). Cubrimos ambos.
    const message =
      body?.errors?.join(", ") ?? body?.error ?? "Ocurrió un error inesperado";
    throw new Error(message);
  }

  return body;
}

// --- Auth ---
// POST /registration y POST /session devuelven { user: {...} } si todo sale bien.
export const register = (data) =>
  request("/registration", { method: "POST", body: JSON.stringify(data) });

export const login = (data) =>
  request("/session", { method: "POST", body: JSON.stringify(data) });

export const logout = () => request("/session", { method: "DELETE" });

// GET /session también devuelve { user: {...} }; usar para saber si hay
// sesión activa al abrir la app (401 si no la hay).
export const getCurrentSession = () => request("/session");

export const requestPasswordReset = (email_address) =>
  request("/passwords", { method: "POST", body: JSON.stringify({ email_address }) });

// --- Sedes ---
// Todos los endpoints de acá para abajo exigen sesión iniciada (401 si no).
export const getSedes = () => request("/sedes");
export const getSede = (id) => request(`/sedes/${id}`);
export const createSede = (data) =>
  request("/sedes", { method: "POST", body: JSON.stringify(data) });
export const updateSede = (id, data) =>
  request(`/sedes/${id}`, { method: "PATCH", body: JSON.stringify(data) });
export const deleteSede = (id) => request(`/sedes/${id}`, { method: "DELETE" });

// --- Espacios ---
// Campos válidos: nombre, tipo, capacidad, ubicacion, descripcion,
// estado ("activo" | "inactivo"), sede_id.
export const getEspacios = () => request("/espacios");
export const getEspacio = (id) => request(`/espacios/${id}`);
export const createEspacio = (data) =>
  request("/espacios", { method: "POST", body: JSON.stringify(data) });
export const updateEspacio = (id, data) =>
  request(`/espacios/${id}`, { method: "PATCH", body: JSON.stringify(data) });
export const deleteEspacio = (id) => request(`/espacios/${id}`, { method: "DELETE" });

// --- Reservas ---
// GET /reservas devuelve solo las del usuario autenticado (no todas).
// Campos válidos en create/update: espacio_id, fecha, hora_inicio, hora_fin
// (el backend valida solapamiento de horario y asigna el usuario solo).
export const getReservas = () => request("/reservas");
export const getReserva = (id) => request(`/reservas/${id}`);
export const createReserva = (data) =>
  request("/reservas", { method: "POST", body: JSON.stringify(data) });
export const updateReserva = (id, data) =>
  request(`/reservas/${id}`, { method: "PATCH", body: JSON.stringify(data) });
export const deleteReserva = (id) => request(`/reservas/${id}`, { method: "DELETE" });
