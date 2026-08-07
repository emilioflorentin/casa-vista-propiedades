import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Home, Users, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Reveal from '@/components/Reveal';
import roomieLogo from '@/assets/roomie-finder-logo.webp';

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
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 flex flex-col">
      <header className="py-6 px-6">
        <div className="container mx-auto flex justify-center">
          <img
            src="/lovable-uploads/dcb0aee9-6c77-42b4-ac43-890fb3993d1a.png"
            alt="Nazarí Homes"
            className="h-16 w-auto"
          />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="container mx-auto max-w-5xl">
          <Reveal className="text-center mb-10 md:mb-14">
            <h1 className="text-3xl md:text-5xl font-bold text-stone-800 mb-4">
              ¿Qué estás buscando?
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Selecciona una opción y te llevamos al sitio perfecto para ti.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            <Reveal delay={120}>
              <Link
                to="/inicio"
                className="group block h-full bg-white rounded-3xl border border-stone-200 p-8 md:p-10 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="h-16 w-16 rounded-2xl bg-stone-100 flex items-center justify-center mb-6 group-hover:bg-stone-200 transition-colors">
                  <Home className="w-8 h-8 text-stone-700" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-stone-800 mb-3">
                  Buscar una vivienda
                </h2>
                <p className="text-muted-foreground mb-8 leading-relaxed">
                  Explora pisos, casas y apartamentos en Nazarí Homes. Encuentra tu próximo hogar con gestión integral.
                </p>
                <Button
                  size="lg"
                  className="w-full bg-stone-700 hover:bg-stone-800 text-white group-hover:shadow-md transition-all"
                >
                  Ir a Nazarí Homes
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </Reveal>

            <Reveal delay={240}>
              <Link
                to="/roomie-finder"
                className="group block h-full bg-white rounded-3xl border border-stone-200 p-8 md:p-10 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="h-16 w-16 rounded-2xl bg-amber-50 flex items-center justify-center mb-6 group-hover:bg-amber-100 transition-colors">
                  <Users className="w-8 h-8 text-amber-600" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-stone-800 mb-3">
                  Encontrar compañero de piso
                </h2>
                <p className="text-muted-foreground mb-8 leading-relaxed">
                  Habitaiones reales, gastos claros y perfiles de convivencia. Desliza, haz match y habla solo con quien encaja contigo.
                </p>
                <div className="flex items-center gap-3 mb-6">
                  <img
                    src={roomieLogo}
                    alt="Roomie Finder"
                    className="h-8 w-auto object-contain"
                  />
                  <span className="text-sm text-stone-500">by Nazarí Homes</span>
                </div>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full border-stone-300 text-stone-700 hover:bg-stone-50 hover:text-stone-900 group-hover:border-stone-400 transition-all"
                >
                  Ir a Roomie Finder
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </Reveal>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Nazarí Homes. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export default LandingGateway;
