import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, ArrowLeft } from 'lucide-react';
import roomieLogo from '@/assets/roomie-finder-logo.webp';

const links = [
  { to: '/roomie-finder', label: 'Descubrir' },
  { to: '/roomie-finder/matches', label: 'Mis matches' },
  { to: '/roomie-finder/mi-perfil', label: 'Mi ficha' },
];

const RoomieHeader = () => {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-roomie-ink/5">
      <div className="container mx-auto px-6 h-[72px] flex items-center justify-between gap-4">
        <div className="flex items-center gap-10">
          <Link to="/roomie-finder" className="flex items-center shrink-0">
            <img src={roomieLogo} alt="Roomie Finder by Nazarí Homes" className="h-11 md:h-14 w-auto object-contain" />
          </Link>

          <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-roomie-ink/60">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`transition-colors hover:text-roomie-green ${pathname === l.to ? 'text-roomie-green' : ''}`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="hidden md:flex items-center gap-5">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-roomie-ink/40 hover:text-roomie-gold transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Volver a Nazarí Homes
          </Link>
          <Link to="/roomie-finder/publicar">
            <Button className="rounded-full bg-roomie-green text-white hover:bg-roomie-ink px-5">
              Publicar habitación
            </Button>
          </Link>
        </div>

        <button className="md:hidden p-2" onClick={() => setOpen((o) => !o)} aria-label="Menú Roomie Finder">
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {open && (
        <nav className="md:hidden border-t border-roomie-ink/5 bg-white px-6 py-3 flex flex-col gap-1">
          {links.map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="py-2 text-sm font-medium text-roomie-ink">
              {l.label}
            </Link>
          ))}
          <Link to="/roomie-finder/publicar" onClick={() => setOpen(false)} className="py-2 text-sm font-semibold text-roomie-green">
            Publicar habitación
          </Link>
          <Link to="/roomie-finder/acceso" onClick={() => setOpen(false)} className="py-2 text-sm text-muted-foreground">
            Acceso anunciantes
          </Link>
          <Link to="/" onClick={() => setOpen(false)} className="py-2 text-sm text-muted-foreground">
            ← Volver a Nazarí Homes
          </Link>
        </nav>
      )}
    </header>
  );
};

export default RoomieHeader;
