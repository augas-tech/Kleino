const HORA = /^([01]\d|2[0-3]):[0-5]\d$/;

export function validarEspacio(f) {
  const errores = [];
  if (!String(f.nombre ?? "").trim()) errores.push("El nombre es obligatorio.");
  const cap = Number(f.capacidad);
  if (!Number.isInteger(cap) || cap <= 0) errores.push("La capacidad debe ser un número mayor a 0.");
  if (!f.sede_id) errores.push("Elige una sede.");
  const a = String(f.hora_apertura ?? "").trim();
  const c = String(f.hora_cierre ?? "").trim();
  if (a || c) {
    if (!HORA.test(a) || !HORA.test(c)) errores.push("El horario debe tener formato HH:MM.");
    else if (c <= a) errores.push("La hora de cierre debe ser posterior a la de apertura.");
  }
  return errores;
}
