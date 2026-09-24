import { Logomark } from "./Navbar.jsx";

export default function Footer() {
  return (
    <footer className="bg-navy">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 py-8 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-2.5">
          <Logomark />
          <span className="text-base font-bold text-white">Kleino</span>
        </div>
        <p className="eyebrow text-slate-400">
          © 2026 Kleino · Reserva de espacios compartidos
        </p>
      </div>
    </footer>
  );
}
