import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Building2, Users } from 'lucide-react';
import Reveal from '@/components/Reveal';
import gatewayHome from '@/assets/gateway-home.jpg';

const LandingGateway = () => {
  useEffect(() => {
    document.title = 'Nazarí Homes & Roomie Finder — ¿Qué estás buscando?';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute(
        'content',
        'Elige tu camino: explora viviendas en Nazarí Homes o encuentra compañero de piso con Roomie Finder.'
      );
    }
  }, []);

  return (
    <div className="min-h-screen bg-roomie-sand text-roomie-ink">
      <header className="absolute inset-x-0 top-0 z-30 px-5 py-5 md:px-10 md:py-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <img
            src="/lovable-uploads/dcb0aee9-6c77-42b4-ac43-890fb3993d1a.png"
            alt="Nazarí Homes"
            className="h-9 w-auto md:h-12"
          />
          <p className="hidden text-xs font-semibold uppercase tracking-widest text-roomie-ink/55 md:block">
            Dos formas de encontrar tu lugar
          </p>
        </div>
      </header>

      <main className="relative min-h-[calc(100vh-3.5rem)] overflow-hidden pt-24 md:min-h-[760px] md:pt-0">
        <div className="absolute right-0 top-0 h-[48%] w-[92%] overflow-hidden md:h-full md:w-[58%]">
          <img
            src={gatewayHome}
            alt="Salón luminoso de una vivienda compartida"
            width={1600}
            height={1200}
            className="h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-roomie-ink/10 md:bg-roomie-ink/5" />
        </div>

        <div className="relative mx-auto flex min-h-[calc(100vh-9rem)] max-w-7xl flex-col px-5 pb-8 md:min-h-[760px] md:justify-center md:px-10 md:py-36">
          <Reveal className="relative z-10 max-w-2xl pt-[28vh] md:max-w-xl md:pt-0">
            <p className="mb-4 flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-roomie-green">
              <span className="h-px w-10 bg-roomie-gold" />
              Tu próximo hogar empieza aquí
            </p>
            <h1 className="text-4xl font-bold leading-tight md:text-6xl lg:text-7xl">
              ¿Qué estás buscando?
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-roomie-ink/65 md:text-lg">
              Elige cómo quieres encontrar tu lugar. Dos servicios distintos, con la confianza de Nazarí Homes.
            </p>
          </Reveal>

          <div className="relative z-20 mt-8 grid w-full gap-3 md:mt-12 md:max-w-4xl md:grid-cols-2 md:gap-0">
            <Reveal delay={100}>
              <Link
                to="/inicio"
                className="group flex min-h-44 items-end justify-between gap-5 bg-roomie-ink p-6 text-roomie-sand transition-transform duration-300 hover:-translate-y-1 md:min-h-56 md:p-8"
              >
                <div className="flex h-full flex-col justify-between">
                  <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-roomie-gold">
                    <Building2 className="h-5 w-5" />
                    Nazarí Homes
                  </div>
                  <div className="mt-8">
                    <h2 className="text-2xl font-bold md:text-3xl">Busco una vivienda</h2>
                    <p className="mt-2 max-w-xs text-sm leading-relaxed text-roomie-sand/65">
                      Viviendas y locales en alquiler o venta con gestión integral.
                    </p>
                  </div>
                </div>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center border border-roomie-sand/30 transition-colors group-hover:bg-roomie-gold group-hover:text-roomie-ink">
                  <ArrowUpRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  <span className="sr-only">Entrar en Nazarí Homes</span>
                </span>
              </Link>
            </Reveal>

            <Reveal delay={190} className="md:translate-y-8">
              <Link
                to="/roomie-finder"
                className="group flex min-h-44 items-end justify-between gap-5 border border-roomie-ink/10 bg-background p-6 transition-transform duration-300 hover:-translate-y-1 md:min-h-56 md:p-8"
              >
                <div className="flex h-full flex-col justify-between">
                  <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-roomie-green">
                    <Users className="h-5 w-5" />
                    Roomie Finder
                  </div>
                  <div className="mt-8">
                    <h2 className="text-2xl font-bold md:text-3xl">Busco compañero de piso</h2>
                    <p className="mt-2 max-w-xs text-sm leading-relaxed text-roomie-ink/60">
                      Habitaciones, gastos claros y perfiles compatibles. Sin registro.
                    </p>
                  </div>
                </div>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center border border-roomie-ink/20 transition-colors group-hover:bg-roomie-green group-hover:text-roomie-sand">
                  <ArrowUpRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  <span className="sr-only">Entrar en Roomie Finder</span>
                </span>
              </Link>
            </Reveal>
          </div>

          <p className="relative z-10 mt-6 text-xs text-roomie-ink/45 md:mt-14">
            Roomie Finder es un servicio de Nazarí Homes.
          </p>
        </div>
      </main>

      <footer className="border-t border-roomie-ink/10 px-5 py-5 text-center text-xs text-roomie-ink/50">
        <p>© {new Date().getFullYear()} Nazarí Homes · Gestión inmobiliaria integral.</p>
      </footer>
    </div>
  );
};

export default LandingGateway;
