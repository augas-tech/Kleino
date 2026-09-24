const steps = [
  {
    number: "1",
    title: "Busca un espacio",
    description: "Filtra por tipo, capacidad y horario disponible.",
  },
  {
    number: "2",
    title: "Crea tu reserva",
    description: "Confirma el horario y recibe la aprobación automática.",
  },
  {
    number: "3",
    title: "Haz check-in",
    description: "Escanea el QR al llegar. Simple como debe ser.",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="como-funciona"
      className="relative overflow-hidden bg-navy py-24"
    >
      {/* leve resplandor para que el navy no quede plano */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-teal/10 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-6">
        <p className="eyebrow text-brand-teal">Cómo funciona</p>
        <h2 className="mt-3 text-4xl font-extrabold text-white">
          Tres pasos. Nada más.
        </h2>

        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.number}
              className="rounded-xl bg-navy-card p-6 shadow-inner shadow-black/10"
            >
              <p className="text-2xl font-bold text-brand-teal">
                {step.number}
              </p>
              <p className="mt-4 font-semibold text-white">{step.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
