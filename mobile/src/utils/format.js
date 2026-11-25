const pad = (n) => String(n).padStart(2, "0");
const DIAS = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

export const hhmm = (v) => {
  const m = String(v ?? "").match(/(\d{2}):(\d{2})/);
  return m ? `${m[1]}:${m[2]}` : "";
};

export const toISODate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const toHHMM = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

export const parseISODate = (s) => {
  const [y, m, d] = String(s).slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const dateWithTime = (value, base = new Date()) => {
  const [h, mi] = hhmm(value).split(":").map(Number);
  const d = new Date(base);
  d.setHours(h || 0, mi || 0, 0, 0);
  return d;
};

export const fechaLarga = (s) => {
  const d = parseISODate(s);
  return `${DIAS[d.getDay()]} ${d.getDate()} ${MESES[d.getMonth()]} ${d.getFullYear()}`;
};

export const tipoLabel = (t) => {
  if (!t) return "Espacio";
  const txt = String(t).replace(/_/g, " ");
  return txt.charAt(0).toUpperCase() + txt.slice(1);
};

export const ESTADOS = {
  pendiente: { label: "Pendiente", color: "#b45309", bg: "#fef3c7" },
  aprobada: { label: "Aprobada", color: "#047857", bg: "#d1fae5" },
  rechazada: { label: "Rechazada", color: "#b91c1c", bg: "#fee2e2" },
  cancelada: { label: "Cancelada", color: "#475569", bg: "#e2e8f0" },
  completada: { label: "Completada", color: "#1d4ed8", bg: "#dbeafe" },
};
