import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Home, Users, ArrowRight } from 'lucide-react';
import Reveal from '@/components/Reveal';

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
    <div className="min-h-screen bg-roomie-sand flex flex-col">
      <header className="py-8 px-6">
        <div className="container mx-auto flex justify-center">
          <img
            src="/lovable-uploads/dcb0aee9-6c77-42b4-ac43-890fb3993d1a.png"
            alt="Nazarí Homes"
            className="h-14 w-auto"
          />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 pb-16">
        <div className="container mx-auto max-w-4xl">
          <Reveal className="text-center mb-10">
            <h1 className="text-3xl md:text-5xl font-bold text-roomie-ink mb-3">¿Qué estás buscando?</h1>
            <p className="text-lg text-roomie-ink/60">Elige una opción para continuar.</p>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-5">
            <Reveal delay={100}>
              <Link
                to="/inicio"
                className="group flex h-full flex-col items-start bg-white rounded-3xl border border-roomie-ink/5 p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="h-14 w-14 rounded-2xl bg-roomie-sand flex items-center justify-center mb-6 group-hover:bg-roomie-gold transition-colors">
                  <Home className="w-7 h-7 text-roomie-ink group-hover:text-white transition-colors" />
                </div>
                <h2 className="text-2xl font-bold text-roomie-ink mb-2">Una vivienda</h2>
                <p className="text-roomie-ink/60 leading-relaxed mb-8">
                  Pisos, casas y locales en alquiler o venta con gestión integral.
                </p>
                <span className="mt-auto inline-flex items-center gap-2 font-bold text-roomie-green">
                  Entrar en Nazarí Homes
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </Reveal>

            <Reveal delay={200}>
              <Link
                to="/roomie-finder"
                className="group flex h-full flex-col items-start bg-white rounded-3xl border border-roomie-ink/5 p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="h-14 w-14 rounded-2xl bg-roomie-sand flex items-center justify-center mb-6 group-hover:bg-roomie-gold transition-colors">
                  <Users className="w-7 h-7 text-roomie-ink group-hover:text-white transition-colors" />
                </div>
                <h2 className="text-2xl font-bold text-roomie-ink mb-2">Un compañero de piso</h2>
                <p className="text-roomie-ink/60 leading-relaxed mb-8">
                  Habitaciones con gastos claros y perfiles de convivencia. Sin registro.
                </p>
                <span className="mt-auto inline-flex items-center gap-2 font-bold text-roomie-green">
                  Entrar en Roomie Finder
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </Reveal>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-sm text-roomie-ink/50">
        <p>© {new Date().getFullYear()} Nazarí Homes · Roomie Finder es un servicio de Nazarí Homes.</p>
      </footer>
    </div>
  );
};

export default LandingGateway;
