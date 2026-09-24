import { FiCalendar, FiClock, FiPhone, FiGrid } from "react-icons/fi";

const features = [
  {
    icon: FiCalendar,
    title: "Disponibilidad en tiempo real",
    description:
      "Consulta qué espacios están libres ahora mismo. Sin llamadas, sin formularios, sin esperas.",
  },
  {
    icon: FiClock,
    title: "Reserva en segundos",
    description:
      "Elige el espacio, selecciona el horario y confirma. Tu reserva queda asegurada al instante.",
  },
  {
    icon: FiPhone,
    title: "Confirmación automática",
    description:
      "Recibe un aviso en el momento en que tu reserva es aprobada o cancelada.",
  },
  {
    icon: FiGrid,
    title: "Check-in por QR",
    description:
      "Al llegar, escanea el código QR del espacio desde la app. Tu asistencia queda registrada.",
  },
];

export default function Features() {
  return (
    <section id="funciones" className="bg-slate-50 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <p className="eyebrow text-brand-teal">Funciones</p>
        <h2 className="mt-3 max-w-lg text-4xl font-extrabold leading-tight text-navy">
          Todo lo que necesitas, sin lo que no.
        </h2>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="card-lift rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <Icon className="h-6 w-6 text-brand-teal" strokeWidth={2} />
              <p className="mt-4 font-semibold text-navy">{title}</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
