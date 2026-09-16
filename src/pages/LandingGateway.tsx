import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Building2, Home, KeyRound, MapPin, Search, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BrandLogo from '@/components/BrandLogo';
import gatewayHome from '@/assets/gateway-home.jpg';

const LandingGateway = () => {
  const navigate = useNavigate();
  const [operation, setOperation] = useState<'sale' | 'rent'>('sale');
  const [query, setQuery] = useState('');

  useEffect(() => {
    document.title = 'PisoGo — Compra, alquila y vende viviendas';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute(
        'content',
        'Encuentra viviendas en venta y alquiler, publica tu inmueble o busca compañero de piso con PisoGo.'
      );
    }
  }, []);

  const search = (event: FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams({ operation });
    if (query.trim()) params.set('q', query.trim());
    navigate(`/properties?${params.toString()}`);
  };

  return <div className="min-h-screen bg-secondary text-foreground">
    <header className="relative z-30 border-b border-primary/15 bg-primary">
      <div className="mx-auto flex h-24 max-w-7xl items-center justify-between px-5 md:px-8">
        <BrandLogo />
        <nav className="hidden items-center gap-7 text-sm font-semibold text-primary-foreground md:flex">
          <Link to="/properties?operation=sale" className="hover:text-accent">Comprar</Link>
          <Link to="/properties?operation=rent" className="hover:text-accent">Alquilar</Link>
          <Link to="/roomie-finder" className="hover:text-accent">Compartir piso</Link>
          <Link to="/account" className="border-l border-primary-foreground/25 pl-7 hover:text-accent">Publicar anuncio</Link>
        </nav>
        <Button asChild variant="secondary" className="md:hidden"><Link to="/account">Mi cuenta</Link></Button>
      </div>
    </header>

    <main>
      <section className="relative isolate overflow-hidden bg-primary">
        <img src={gatewayHome} alt="Interior de una vivienda luminosa" className="absolute inset-0 -z-20 h-full w-full object-cover opacity-40" />
        <div className="absolute inset-0 -z-10 bg-primary/80" />
        <div className="mx-auto flex min-h-[610px] max-w-7xl flex-col items-center justify-center px-5 py-16 text-center md:px-8">
          <p className="mb-4 text-sm font-semibold uppercase text-accent">Comprar · Alquilar · Vender</p>
          <h1 className="max-w-4xl text-4xl font-bold leading-tight text-primary-foreground md:text-6xl">Encuentra tu lugar ideal para vivir</h1>
          <p className="mt-5 max-w-2xl text-lg text-primary-foreground/80">Viviendas de particulares y profesionales, reunidas en un portal sencillo y transparente.</p>

          <form onSubmit={search} className="mt-10 w-full max-w-4xl text-left">
            <div className="flex gap-1 px-2">
              {([['sale', 'Comprar'], ['rent', 'Alquilar']] as const).map(([value, label]) => (
                <Button key={value} type="button" variant={operation === value ? 'secondary' : 'ghost'} onClick={() => setOperation(value)} className={operation === value ? 'rounded-b-none' : 'rounded-b-none text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground'}>{label}</Button>
              ))}
              <Button asChild type="button" variant="ghost" className="rounded-b-none text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"><Link to="/roomie-finder">Compartir</Link></Button>
            </div>
            <div className="flex flex-col gap-3 bg-card p-3 shadow-2xl md:flex-row">
              <label className="relative flex-1">
                <span className="sr-only">Ubicación o referencia</span>
                <MapPin className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ciudad, barrio o referencia" className="h-14 w-full rounded-md bg-secondary pl-12 pr-4 text-foreground outline-none ring-primary focus:ring-2" />
              </label>
              <Button type="submit" size="lg" className="h-14 px-9 text-base"><Search className="h-5 w-5" />Buscar viviendas</Button>
            </div>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 md:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div><p className="text-sm font-semibold text-primary">Empieza por aquí</p><h2 className="mt-1 text-3xl font-bold">¿Qué necesitas hoy?</h2></div>
          <Link to="/properties" className="hidden items-center gap-2 text-sm font-semibold text-primary md:flex">Ver todos los anuncios <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { to: '/properties?operation=sale', icon: Home, title: 'Comprar vivienda', copy: 'Pisos, casas y estudios en venta.' },
            { to: '/properties?operation=rent', icon: KeyRound, title: 'Alquilar vivienda', copy: 'Encuentra un alquiler que encaje contigo.' },
            { to: '/account', icon: Building2, title: 'Publicar inmueble', copy: 'Anuncia una vivienda de forma sencilla.' },
            { to: '/roomie-finder', icon: Users, title: 'Roomie Finder', copy: 'Busca habitación o compañero de piso.' },
          ].map(({ to, icon: Icon, title, copy }) => <Link key={title} to={to} className="group flex min-h-52 flex-col justify-between border border-border bg-card p-6 transition duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
            <Icon className="h-8 w-8 text-primary" /><div><h3 className="text-xl font-bold">{title}</h3><p className="mt-2 text-sm text-muted-foreground">{copy}</p><ArrowRight className="mt-5 h-5 w-5 text-primary transition-transform group-hover:translate-x-1" /></div>
          </Link>)}
        </div>
      </section>
    </main>

    <footer className="border-t border-primary/15 bg-primary px-5 py-6 text-center text-sm text-primary-foreground/70">
      <p>© {new Date().getFullYear()} PisoGo · Tu portal inmobiliario.</p>
      <p className="mt-1 text-primary-foreground/50">Nazarí Homes es la inmobiliaria de PisoGo · Roomie Finder es un servicio de PisoGo.</p>
    </footer>
  </div>;
};

export default LandingGateway;
