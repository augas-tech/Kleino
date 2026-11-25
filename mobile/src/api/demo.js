// Modo demo: responde como la API, con datos en memoria. Solo para capturas.
const dia = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  const p = (x) => String(x).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

const USUARIOS = {
  "admin@kleino.cl": { id: 1, email_address: "admin@kleino.cl", rol: "administrador" },
  "docente@kleino.cl": { id: 2, email_address: "docente@kleino.cl", rol: "usuario" },
};
let actual = null;
let nextId = 100;

const sedes = [{ id: 1, nombre: "Sede Central", direccion: "Av. Libertador Bernardo O'Higgins 1234" }];
const espacios = [
  { id: 1, nombre: "Sala de Reuniones A", tipo: "sala_reunion", capacidad: 8, ubicacion: "Piso 2", descripcion: "Sala con proyector y pizarra", estado: "activo", sede_id: 1, hora_apertura: "08:00", hora_cierre: "20:00" },
  { id: 2, nombre: "Cancha Techada", tipo: "cancha", capacidad: 10, ubicacion: "Patio central", descripcion: "Cancha multiuso techada", estado: "activo", sede_id: 1, hora_apertura: "08:00", hora_cierre: "20:00" },
  { id: 3, nombre: "Laboratorio 3", tipo: "laboratorio", capacidad: 20, ubicacion: "Piso 3", descripcion: "En mantención", estado: "inactivo", sede_id: 1, hora_apertura: "09:00", hora_cierre: "18:00" },
];
const reservas = [
  { id: 1, user_id: 2, espacio_id: 1, fecha: dia(1), hora_inicio: "10:00", hora_fin: "11:00", estado: "pendiente" },
  { id: 2, user_id: 2, espacio_id: 2, fecha: dia(2), hora_inicio: "14:00", hora_fin: "15:00", estado: "aprobada" },
];

const error = (status, message) => Object.assign(new Error(message), { status });
const copia = (x) => JSON.parse(JSON.stringify(x));
const SIN_PERMISO = "No tienes permiso para realizar esta acción";

function choca(d, ignorar) {
  const hay = reservas.some((r) =>
    r.id !== ignorar && r.espacio_id === Number(d.espacio_id) && r.fecha === d.fecha &&
    !["cancelada", "rechazada"].includes(r.estado) &&
    d.hora_inicio < r.hora_fin && r.hora_inicio < d.hora_fin
  );
  if (hay) throw error(422, "El espacio ya está reservado en ese horario");
}

export async function demoRequest(path, { method = "GET", body } = {}) {
  await new Promise((r) => setTimeout(r, 250));
  const [ruta, idTxt, accion] = path.replace(/^\//, "").split("/");
  const id = Number(idTxt);

  if (ruta === "session") {
    if (method === "POST") {
      const u = USUARIOS[String(body?.email_address).toLowerCase()];
      if (!u || body?.password !== "kleino2026") throw error(401, "Email o contraseña incorrectos");
      actual = u;
      return { user: copia(u), token: "demo-token" };
    }
    if (method === "DELETE") { actual = null; return null; }
    if (!actual) throw error(401, "Debes iniciar sesión");
    return { user: copia(actual) };
  }
  if (!actual) throw error(401, "Debes iniciar sesión");
  const admin = actual.rol === "administrador";

  if (ruta === "sedes") return copia(sedes);

  if (ruta === "espacios") {
    if (method === "GET") return copia(idTxt ? espacios.find((e) => e.id === id) : espacios);
    if (!admin) throw error(403, SIN_PERMISO);
    if (method === "POST") {
      const e = { ...body, id: nextId++ };
      espacios.push(e);
      return copia(e);
    }
    const e = espacios.find((x) => x.id === id);
    Object.assign(e, body);
    return copia(e);
  }

  if (ruta === "reservas") {
    const visibles = admin ? reservas : reservas.filter((r) => r.user_id === actual.id);
    if (method === "GET") return copia(visibles);
    if (method === "POST") {
      if (admin) throw error(403, SIN_PERMISO);
      choca(body);
      const r = { ...body, id: nextId++, user_id: actual.id, estado: "pendiente" };
      reservas.push(r);
      return copia(r);
    }
    const r = visibles.find((x) => x.id === id);
    if (!r) throw error(404, "Recurso no encontrado");
    if (accion === "cancelar") { r.estado = "cancelada"; return copia(r); }
    if (admin) throw error(403, SIN_PERMISO);
    choca({ ...r, ...body }, r.id);
    Object.assign(r, body);
    return copia(r);
  }

  throw error(404, "Recurso no encontrado");
}
