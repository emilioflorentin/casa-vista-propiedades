import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus, Search, ShieldCheck } from 'lucide-react';
import heroImage from '@/assets/roomie-hero.jpg';

const STEPS = [
  { n: '01', title: 'Rellena tu ficha', text: 'Sin registro: nombre, teléfono y cómo te gusta convivir. Dos minutos.' },
  { n: '02', title: 'Descubre habitaciones', text: 'Fotos de la vivienda y de la habitación, con los gastos siempre detallados.' },
  { n: '03', title: 'Marca lo que te gusta', text: 'Deslizas o pulsas “me interesa”. Nadie ve tu teléfono todavía.' },
  { n: '04', title: 'Match y WhatsApp', text: 'Si el anunciante también dice que sí, se abre el contacto directo.' },
];

export const RoomieIntro = ({ onStart }: { onStart: () => void }) => (
  <section>
    {/* Hero */}
    <div className="grid lg:grid-cols-[55%_45%] rounded-3xl overflow-hidden border border-roomie-ink/5 bg-roomie-sand">
      <div className="p-5 md:p-14">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-roomie-green/10 text-roomie-green text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-roomie-green" />
            UN SERVICIO DE PISOGO
          </div>

          <h1 className="mt-4 md:mt-7 text-3xl md:text-6xl font-bold text-roomie-ink leading-[1.05]">
            Encuentra tu compañero ideal de piso.
          </h1>

          <p className="mt-3 md:mt-6 text-base md:text-lg text-roomie-ink/70 leading-relaxed">
            Habitaciones con gastos claros y perfiles de convivencia reales. Sin registro para quien busca.
          </p>

          <div className="mt-5 md:mt-10 grid sm:grid-cols-2 gap-3 md:gap-4">
            <Button
              onClick={onStart}
              className="w-full h-auto py-4 md:py-5 rounded-2xl bg-roomie-green text-white text-base font-bold hover:bg-roomie-ink shadow-xl shadow-roomie-green/20"
            >
              Busco habitación <Search className="w-5 h-5 ml-2" />
            </Button>
            <Link to="/roomie-finder/publicar" className="w-full">
              <Button
                variant="outline"
                className="w-full h-auto py-4 md:py-5 rounded-2xl bg-white border-2 border-roomie-ink/10 text-roomie-ink text-base font-bold hover:border-roomie-gold"
              >
                Publico habitación <Plus className="w-5 h-5 ml-2 text-roomie-gold" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="relative min-h-[200px] md:min-h-[320px] bg-roomie-ink">
        <img
          src={heroImage}
          alt="Salón luminoso de un piso compartido"
          width={896}
          height={1344}
          className="w-full h-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-roomie-ink/70 via-transparent to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-6 bg-white p-3 md:p-5 rounded-2xl shadow-2xl border-l-4 border-roomie-gold flex items-center gap-3 md:gap-4">
          <div className="w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-full bg-roomie-sand flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 md:w-6 md:h-6 text-roomie-green" />
          </div>
          <div>
            <h2 className="font-bold text-sm md:text-base text-roomie-ink">Tu teléfono, privado</h2>
            <p className="text-xs md:text-sm text-roomie-ink/60">Solo se comparte cuando las dos partes dicen que sí.</p>
          </div>
        </div>
      </div>
    </div>

    {/* Cómo funciona */}
    <div className="py-16 md:py-24">
      <div className="flex flex-col md:flex-row md:items-end gap-6 mb-12">
        <div className="max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-bold text-roomie-ink">¿Cómo funciona Roomie Finder?</h2>
          <p className="mt-3 text-lg text-roomie-ink/60">Cuatro pasos simples, sin cuentas ni mensajes en frío.</p>
        </div>
        <div className="h-px flex-1 bg-roomie-ink/10 hidden md:block mb-4" />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((s, i) => {
          const last = i === STEPS.length - 1;
          return (
            <div
              key={s.n}
              className={`group p-8 rounded-3xl transition-all duration-300 ${
                last
                  ? 'bg-roomie-green shadow-lg lg:-translate-y-4'
                  : 'bg-white border border-roomie-ink/5 hover:shadow-xl'
              }`}
            >
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-2xl mb-6 transition-colors ${
                  last
                    ? 'bg-roomie-gold text-white'
                    : 'bg-roomie-sand text-roomie-ink group-hover:bg-roomie-gold group-hover:text-white'
                }`}
              >
                {s.n}
              </div>
              <h3 className={`text-xl font-bold mb-3 ${last ? 'text-white' : 'text-roomie-ink'}`}>{s.title}</h3>
              <p className={`leading-relaxed ${last ? 'text-white/80' : 'text-roomie-ink/60'}`}>{s.text}</p>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);

export default RoomieIntro;
