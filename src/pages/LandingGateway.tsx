import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight, Building2, Home, KeyRound, MapPin, Plus, Search, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BrandLogo from '@/components/BrandLogo';
import LocationSearchOverlay from '@/components/LocationSearchOverlay';
import gatewayHome from '@/assets/gateway-home.jpg';

const LandingGateway = () => {
  const navigate = useNavigate();
  const [operation, setOperation] = useState<'sale' | 'rent'>('sale');
  const [query, setQuery] = useState('');
  const [locationOpen, setLocationOpen] = useState(false);
  const [locationError, setLocationError] = useState(false);

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
    if (!query.trim()) {
      setLocationError(true);
      setLocationOpen(true);
      return;
    }
    setLocationError(false);
    const params = new URLSearchParams({ operation });
    params.set('q', query.trim());
    navigate(`/properties?${params.toString()}`);
  };

  return <div className="min-h-screen bg-secondary text-foreground">
    <header className="relative z-30 border-b border-accent/50 bg-header shadow-[0_2px_12px_rgba(0,0,0,0.25)]">
      <div className="mx-auto flex h-28 max-w-7xl items-center justify-between px-6 md:h-36 md:px-8">
        <BrandLogo className="h-20 max-[359px]:h-16 md:h-28" />
        <nav className="hidden items-center gap-7 text-sm font-semibold text-primary-foreground md:flex">
          <Link to="/properties?operation=sale" className="hover:text-accent">Comprar</Link>
          <Link to="/properties?operation=rent" className="hover:text-accent">Alquilar</Link>
          <Link to="/roomie-finder" className="hover:text-accent">Compartir piso</Link>
        </nav>
        <div className="flex shrink-0 items-center gap-2.5 max-[359px]:gap-2 md:gap-3">
          <Button asChild variant="secondary" className="h-11 rounded-full px-3.5 font-semibold max-[359px]:h-10 max-[359px]:px-3 md:h-12 md:px-6"><Link to="/account">Mi cuenta</Link></Button>
          <Button asChild aria-label="Publicar vivienda" className="h-11 shrink-0 rounded-full bg-accent px-3.5 font-semibold text-accent-foreground shadow-lg shadow-black/20 transition hover:bg-accent/90 max-[359px]:h-10 max-[359px]:px-3 md:h-12 md:px-6">
            <Link to="/account">
              <Plus className="h-5 w-5" />
              <span className="hidden sm:inline">Publicar vivienda</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>

    <main>
      <section className="relative isolate overflow-hidden bg-primary">
        <img src={gatewayHome} alt="Interior de una vivienda luminosa" className="absolute inset-0 -z-20 h-full w-full object-cover opacity-40" />
        <div className="absolute inset-0 -z-10 bg-primary/80" />
        <div className="mx-auto flex min-h-[440px] max-w-7xl flex-col items-center justify-center px-5 py-10 text-center md:min-h-[610px] md:px-8 md:py-16">
          <p className="mb-3 text-xs font-semibold uppercase text-accent md:mb-4 md:text-sm">Comprar · Alquilar · Vender</p>
          <h1 className="max-w-4xl text-3xl font-bold leading-tight text-primary-foreground md:text-6xl">Encuentra tu lugar ideal para vivir</h1>
          <p className="mt-3 max-w-2xl text-base text-primary-foreground/80 md:mt-5 md:text-lg">Viviendas de particulares y profesionales, reunidas en un portal sencillo y transparente.</p>

          <form onSubmit={search} className="mt-6 w-full max-w-4xl text-left md:mt-10">
            <div className="flex gap-1 px-2">
              {([['sale', 'Comprar'], ['rent', 'Alquilar']] as const).map(([value, label]) => (
                <Button key={value} type="button" variant={operation === value ? 'secondary' : 'ghost'} onClick={() => setOperation(value)} className={operation === value ? 'rounded-b-none' : 'rounded-b-none text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground'}>{label}</Button>
              ))}
              <Button asChild type="button" variant="ghost" className="rounded-b-none text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"><Link to="/roomie-finder">Compartir</Link></Button>
            </div>
            <div className="flex flex-col gap-2 bg-card p-2 shadow-2xl md:flex-row md:gap-3 md:p-3">
              <div className="relative flex-1">
                <MapPin className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <button type="button" onClick={() => setLocationOpen(true)} className={`h-12 w-full rounded-md bg-secondary pl-12 pr-4 text-left text-base outline-none ring-primary focus:ring-2 md:h-14 ${query ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {query || 'Ciudad, barrio o referencia'}
                </button>
              </div>
              <Button type="submit" size="lg" className="h-12 px-9 text-base md:h-14"><Search className="h-5 w-5" />Buscar viviendas</Button>
            </div>
          </form>
          <LocationSearchOverlay
            open={locationOpen}
            initialValue={query}
            onClose={() => setLocationOpen(false)}
            onSelect={(value) => {
              setQuery(value.address);
              setLocationOpen(false);
              const params = new URLSearchParams({ operation });
              if (value.address.trim()) params.set('q', value.address.trim());
              if ('lat' in value) {
                params.set('lat', String(value.lat));
                params.set('lng', String(value.lng));
                params.set('radius', String(value.radius));
                if (value.polygon?.length) {
                  params.set('poly', value.polygon.map(([la, ln]) => `${la.toFixed(5)},${ln.toFixed(5)}`).join(';'));
                }
              }
              navigate(`/properties?${params.toString()}`);
            }}
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-14">
        <div className="mb-5 flex items-end justify-between gap-4 md:mb-8">
          <div><p className="text-sm font-semibold text-primary">Empieza por aquí</p><h2 className="mt-1 text-2xl font-bold md:text-3xl">¿Qué necesitas hoy?</h2></div>
          <Link to="/properties" className="hidden items-center gap-2 text-sm font-semibold text-primary md:flex">Ver todos los anuncios <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="grid gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-4">
          {[
            { to: '/properties?operation=sale', icon: Home, title: 'Comprar vivienda', copy: 'Pisos, casas y estudios en venta.' },
            { to: '/properties?operation=rent', icon: KeyRound, title: 'Alquilar vivienda', copy: 'Encuentra un alquiler que encaje contigo.' },
            { to: '/account', icon: Building2, title: 'Publicar inmueble', copy: 'Anuncia una vivienda de forma sencilla.' },
            { to: '/roomie-finder', icon: Users, title: 'Roomie Finder', copy: 'Busca habitación o compañero de piso.' },
          ].map(({ to, icon: Icon, title, copy }) => <Link key={title} to={to} className="group flex min-h-40 flex-col justify-between border border-border bg-card p-4 transition duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg md:min-h-52 md:p-6">
            <Icon className="h-7 w-7 text-primary md:h-8 md:w-8" /><div><h3 className="text-lg font-bold md:text-xl">{title}</h3><p className="mt-1 text-sm text-muted-foreground md:mt-2">{copy}</p><ArrowRight className="mt-3 h-5 w-5 text-primary transition-transform group-hover:translate-x-1 md:mt-5" /></div>
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
