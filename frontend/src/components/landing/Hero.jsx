import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <div className="relative overflow-hidden bg-hero-glow">
      <div className="mx-auto max-w-6xl px-6 pb-20 pt-20 md:pt-28">
        <h1 className="max-w-3xl text-5xl font-extrabold leading-[1.08] tracking-tight text-navy md:text-6xl">
          Reserva el espacio que necesitas,{" "}
          <span className="text-brand-teal">cuando lo necesitas.</span>
        </h1>

        <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
          Kleino es la plataforma para reservar salas de estudio, laboratorios,
          canchas y espacios compartidos. Sin planillas, sin grupos de
          WhatsApp.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            to="/register"
            className="rounded-lg bg-navy px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-navy-light"
          >
            Crear cuenta gratis
          </Link>
          <a
            href="#como-funciona"
            className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-navy transition-colors hover:border-slate-400"
          >
            Ver cómo funciona
          </a>
        </div>
      </div>
    </div>
  );
}
