// Datos de ejemplo (mock): GET /espacios ya existe en el backend (PR#6),
// pero exige sesión iniciada (como toda la API), así que esta vista
// pública (landing, sin login) no puede consumirlo tal cual. Para el
// panel autenticado (src/pages/Dashboard.jsx) sí correspondería llamar
// a getEspacios() de src/api.js en vez de este arreglo.
// Ojo: "estado" acá (disponible/ocupado) es solo para la maqueta — el
// campo real `estado` del modelo es "activo"/"inactivo" (si el espacio
// está habilitado o no), no si está ocupado en este momento. Saber si
// está ocupado "ahora" requeriría cruzar con /reservas del día, algo
// que no es requisito mínimo de la Tarea 1.
const mockEspacios = [
  { id: 1, tipo: "Estudio", nombre: "Sala de Estudio A", estado: "disponible", capacidad: 6 },
  { id: 2, tipo: "Reunión", nombre: "Sala de Reuniones", estado: "ocupado", capacidad: 10 },
  { id: 3, tipo: "Laboratorio", nombre: "Laboratorio 1", estado: "disponible", capacidad: 20 },
  { id: 4, tipo: "Deporte", nombre: "Cancha Deportiva", estado: "disponible", capacidad: 30 },
  { id: 5, tipo: "Evento", nombre: "Auditorio Principal", estado: "ocupado", capacidad: 120 },
  { id: 6, tipo: "Estudio", nombre: "Sala de Estudio B", estado: "disponible", capacidad: 8 },
];

function EspacioCard({ espacio }) {
  const disponible = espacio.estado === "disponible";
  const statusColor = disponible ? "border-brand-teal" : "border-red-400";
  const dotColor = disponible ? "bg-brand-teal" : "bg-red-500";

  return (
    <button
      type="button"
      disabled={!disponible}
      className={`card-lift rounded-xl border-2 bg-white p-4 text-left shadow-sm ${statusColor} ${
        disponible ? "cursor-pointer" : "cursor-default opacity-90"
      }`}
    >
      <p className="eyebrow text-slate-400">{espacio.tipo}</p>
      <p className="mt-1.5 font-semibold text-navy">{espacio.nombre}</p>
      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5 text-slate-600">
          <span className={`h-2 w-2 rounded-full ${dotColor}`} />
          {disponible ? "Disponible" : "Ocupado"}
        </span>
        <span className="text-slate-400">{espacio.capacidad}p</span>
      </div>
    </button>
  );
}

export default function SpacesPreview() {
  return (
    <section id="espacios" className="mx-auto max-w-6xl px-6 pb-24">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-base font-semibold text-navy">
          Espacios disponibles ahora
        </h2>
        <span className="eyebrow flex items-center gap-1.5 text-brand-teal">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-teal" />
          En vivo
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {mockEspacios.map((espacio) => (
          <EspacioCard key={espacio.id} espacio={espacio} />
        ))}
      </div>

      <p className="mt-4 text-sm text-slate-400">
        ↑ Toca un espacio disponible para reservar
      </p>
    </section>
  );
}
