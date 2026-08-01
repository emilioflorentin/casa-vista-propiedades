import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, Home, ShieldCheck, Sparkles, Users, Wallet, ChevronDown } from 'lucide-react';
import roomieLogo from '@/assets/roomie-finder-logo.png.asset.json';

/** Reveals children with a fade+rise once they enter the viewport. */
const Reveal = ({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${shown ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

const STEPS = [
  {
    icon: Home,
    title: 'Publica tu habitación libre',
    text: 'Sube fotos de la vivienda completa y de la habitación disponible, con el detalle real de los gastos: agua, luz, gas, internet y comunidad.',
  },
  {
    icon: Users,
    title: 'Crea tu perfil de convivencia',
    text: 'Horarios, nivel de socialización, orden, mascotas, si fumas... Lo que de verdad importa para que la convivencia funcione.',
  },
  {
    icon: Sparkles,
    title: 'Descubre deslizando',
    text: 'Ves anuncios uno a uno: te gusta, deslizas a la derecha; no encaja, a la izquierda. Sin listados infinitos ni mensajes en frío.',
  },
  {
    icon: Heart,
    title: 'Match y contacto',
    text: 'Cuando el anunciante acepta tu interés, se abre el contacto por WhatsApp. Tu teléfono nunca es público antes del match.',
  },
];

const HIGHLIGHTS = [
  { icon: Wallet, title: 'Gastos siempre claros', text: 'Obligatorio indicar qué está incluido y una estimación mensual. Cero sorpresas al llegar.' },
  { icon: ShieldCheck, title: 'Privacidad primero', text: 'Los datos de contacto solo se comparten cuando ambas partes dicen que sí.' },
  { icon: Users, title: 'Compatibilidad real', text: 'Filtra por presupuesto, mascotas, fumadores y estilo de convivencia antes de escribir a nadie.' },
];

export const RoomieIntro = ({ onStart }: { onStart: () => void }) => (
  <section className="relative overflow-hidden">
    {/* Hero */}
    <div className="relative py-16 md:py-24 text-center">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white via-stone-50 to-stone-50" />
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 -z-10 h-72 w-72 rounded-full bg-amber-100/50 blur-3xl" />

      <Reveal>
        <img src={roomieLogo.url} alt="Roomie Finder by Nazarí Homes" className="mx-auto h-20 md:h-28 w-auto object-contain" />
      </Reveal>
      <Reveal delay={120}>
        <h1 className="mt-6 text-3xl md:text-5xl font-bold text-stone-800 max-w-3xl mx-auto leading-tight">
          Encuentra compañero de piso sin jugártela
        </h1>
      </Reveal>
      <Reveal delay={220}>
        <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
          Habitaciones reales, gastos detallados y perfiles de convivencia. Desliza, haz match y habla solo con quien encaja contigo.
        </p>
      </Reveal>
      <Reveal delay={320}>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button size="lg" className="bg-stone-800 hover:bg-stone-900" onClick={onStart}>
            <Sparkles className="w-4 h-4 mr-2" /> Empezar a descubrir
          </Button>
        </div>
      </Reveal>
      <Reveal delay={420}>
        <ChevronDown className="mx-auto mt-10 w-6 h-6 text-stone-400 animate-bounce" />
      </Reveal>
    </div>

    {/* Cómo funciona */}
    <div className="py-12 md:py-20 border-t border-stone-200">
      <Reveal>
        <p className="text-center text-xs font-semibold tracking-[0.2em] uppercase text-amber-600">Cómo funciona</p>
        <h2 className="mt-3 text-2xl md:text-3xl font-bold text-center text-stone-800">Cuatro pasos, sin rodeos</h2>
      </Reveal>

      <div className="mt-10 max-w-3xl mx-auto space-y-6">
        {STEPS.map((s, i) => (
          <Reveal key={s.title} delay={i * 90}>
            <div className="flex gap-4 items-start bg-white rounded-2xl border border-stone-200 p-5 hover:shadow-lg transition-shadow">
              <div className="shrink-0 h-11 w-11 rounded-xl bg-stone-100 flex items-center justify-center">
                <s.icon className="w-5 h-5 text-stone-700" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Paso {i + 1}</p>
                <h3 className="font-semibold text-stone-800">{s.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{s.text}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>

    {/* Por qué */}
    <div className="py-12 md:py-20 border-t border-stone-200">
      <Reveal>
        <h2 className="text-2xl md:text-3xl font-bold text-center text-stone-800">Por qué Roomie Finder</h2>
      </Reveal>
      <div className="mt-10 grid gap-5 md:grid-cols-3 max-w-5xl mx-auto">
        {HIGHLIGHTS.map((h, i) => (
          <Reveal key={h.title} delay={i * 120}>
            <div className="h-full bg-white rounded-2xl border border-stone-200 p-6 hover:-translate-y-1 transition-transform">
              <h.icon className="w-6 h-6 text-amber-600" />
              <h3 className="mt-3 font-semibold text-stone-800">{h.title}</h3>
              <p className="text-sm text-muted-foreground mt-1.5">{h.text}</p>
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal delay={200}>
        <div className="mt-12 text-center">
          <Button size="lg" variant="outline" onClick={onStart}>
            Ver habitaciones disponibles
          </Button>
        </div>
      </Reveal>
    </div>
  </section>
);

export default RoomieIntro;