import { Link } from "react-router-dom";

function Logomark({ className = "h-6 w-6" }) {
  return (
    <span className={`grid grid-cols-2 grid-rows-2 gap-[3px] ${className}`}>
      <span className="rounded-[2px] bg-navy" />
      <span className="rounded-[2px] bg-slate-300" />
      <span className="rounded-[2px] bg-slate-300" />
      <span className="rounded-[2px] bg-brand-teal" />
    </span>
  );
}

const links = [
  { label: "Espacios", href: "#espacios" },
  { label: "Funciones", href: "#funciones" },
  { label: "Cómo funciona", href: "#como-funciona" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <Logomark />
          <span className="text-lg font-bold text-navy">Kleino</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-slate-600 transition-colors hover:text-navy"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <Link
          to="/login"
          className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-navy-light"
        >
          Ingresar
        </Link>
      </div>
    </header>
  );
}

export { Logomark };
