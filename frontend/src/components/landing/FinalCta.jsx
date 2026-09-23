import { Link } from "react-router-dom";
import { Logomark } from "../shared/Navbar.jsx";

export default function FinalCta() {
  return (
    <section className="bg-slate-100 py-24">
      <div className="mx-auto flex max-w-2xl flex-col items-center px-6 text-center">
        <Logomark className="h-8 w-8" />

        <h2 className="mt-8 text-3xl font-extrabold text-navy md:text-4xl">
          Empieza a reservar sin complicaciones.
        </h2>
        <p className="mt-4 text-slate-500">
          Sin tarjeta de crédito. Sin configuración. Crea tu cuenta y reserva
          tu primer espacio en minutos.
        </p>

        <Link
          to="/register"
          className="mt-8 rounded-lg bg-navy px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-navy-light"
        >
          Crear cuenta gratis
        </Link>
      </div>
    </section>
  );
}
