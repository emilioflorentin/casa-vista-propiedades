import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, Plus, UserRound, Menu, X, ArrowLeft } from 'lucide-react';
import roomieLogo from '@/assets/roomie-finder-logo.webp';

const links = [
  { to: '/roomie-finder', label: 'Descubrir' },
  { to: '/roomie-finder/publicar', label: 'Publicar habitación', icon: Plus },
  { to: '/roomie-finder/mi-perfil', label: 'Mi perfil', icon: UserRound },
  { to: '/roomie-finder/matches', label: 'Matches', icon: Heart },
];

const RoomieHeader = () => {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-stone-200">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between gap-4">
        <Link to="/roomie-finder" className="flex items-center shrink-0">
          <img src={roomieLogo} alt="Roomie Finder by Nazarí Homes" className="h-14 md:h-16 w-auto object-contain" />
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => {
            const active = pathname === l.to;
            return (
              <Link key={l.to} to={l.to}>
                <Button variant={active ? 'secondary' : 'ghost'} size="sm" className="gap-1.5">
                  {l.icon && <l.icon className="w-4 h-4" />}
                  {l.label}
                </Button>
              </Link>
            );
          })}
          <Link to="/" className="ml-2">
            <Button variant="outline" size="sm" className="gap-1.5">
              <ArrowLeft className="w-4 h-4" /> Nazarí Homes
            </Button>
          </Link>
        </nav>

        <button className="md:hidden p-2" onClick={() => setOpen((o) => !o)} aria-label="Menú Roomie Finder">
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {open && (
        <nav className="md:hidden border-t border-stone-200 bg-white px-6 py-3 flex flex-col gap-1">
          {links.map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="py-2 text-sm font-medium text-stone-700">
              {l.label}
            </Link>
          ))}
          <Link to="/" onClick={() => setOpen(false)} className="py-2 text-sm text-muted-foreground">
            ← Volver a Nazarí Homes
          </Link>
        </nav>
      )}
    </header>
  );
};

export default RoomieHeader;