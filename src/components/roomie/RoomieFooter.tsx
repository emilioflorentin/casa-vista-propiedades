import { Link } from 'react-router-dom';
import roomieLogo from '@/assets/roomie-finder-logo.webp';

const RoomieFooter = () => (
  <footer className="border-t border-stone-200 bg-white mt-16">
    <div className="container mx-auto px-6 py-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="space-y-2 max-w-sm">
        <img src={roomieLogo} alt="Roomie Finder by PisoGo" className="h-14 md:h-16 w-auto object-contain" />
        <p className="text-sm text-muted-foreground">
          Encuentra compañero de piso con perfiles de convivencia reales y gastos claros.
        </p>
      </div>
      <div className="flex flex-col gap-2 text-sm">
        <Link to="/roomie-finder/publicar" className="text-stone-700 hover:underline">Publicar habitación</Link>
        <Link to="/roomie-finder/mi-perfil" className="text-stone-700 hover:underline">Mi perfil roomie</Link>
        <Link to="/roomie-finder/matches" className="text-stone-700 hover:underline">Matches</Link>
        <Link to="/privacy-policy" className="text-muted-foreground hover:underline">Política de privacidad</Link>
        <Link to="/" className="text-muted-foreground hover:underline">Volver a PisoGo</Link>
      </div>
    </div>
    <div className="border-t border-stone-100 py-4 text-center text-xs text-muted-foreground">
      Roomie Finder · by PisoGo · info@nazarihomes.com
    </div>
  </footer>
);

export default RoomieFooter;