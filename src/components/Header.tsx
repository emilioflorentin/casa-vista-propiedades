
import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Heart, User, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/hooks/useFavorites";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { favorites } = useFavorites();

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50 border-b border-stone-200">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/dcb0aee9-6c77-42b4-ac43-890fb3993d1a.png" 
              alt="Nazarí Homes" 
              className="h-12 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-stone-700 font-medium transition-colors">
              Inicio
            </Link>
            <Link to="/properties" className="text-gray-700 hover:text-stone-700 font-medium transition-colors">
              Propiedades
            </Link>
            <Link to="/contact" className="text-gray-700 hover:text-stone-700 font-medium transition-colors">
              Contacto
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/favorites">
              <Button variant="ghost" size="sm" className="text-gray-700 hover:text-stone-700 hover:bg-stone-50 relative">
                <Heart className="h-4 w-4 mr-2" />
                Favoritos
                {favorites.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {favorites.length}
                  </span>
                )}
              </Button>
            </Link>
            <Button variant="ghost" size="sm" className="text-gray-700 hover:text-stone-700 hover:bg-stone-50">
              <User className="h-4 w-4 mr-2" />
              Mi Cuenta
            </Button>
            <Button size="sm" className="bg-stone-600 hover:bg-stone-700 text-white">
              <Phone className="h-4 w-4 mr-2" />
              Contactar
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-gray-700" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-stone-200">
            <nav className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className="text-gray-700 hover:text-stone-700 font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Inicio
              </Link>
              <Link 
                to="/properties" 
                className="text-gray-700 hover:text-stone-700 font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Propiedades
              </Link>
              <Link 
                to="/contact" 
                className="text-gray-700 hover:text-stone-700 font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Contacto
              </Link>
              <div className="flex flex-col space-y-2 pt-4 border-t border-stone-200">
                <Link to="/favorites" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="ghost" size="sm" className="justify-start text-gray-700 hover:text-stone-700 hover:bg-stone-50 w-full relative">
                    <Heart className="h-4 w-4 mr-2" />
                    Favoritos
                    {favorites.length > 0 && (
                      <span className="absolute right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {favorites.length}
                      </span>
                    )}
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" className="justify-start text-gray-700 hover:text-stone-700 hover:bg-stone-50">
                  <User className="h-4 w-4 mr-2" />
                  Mi Cuenta
                </Button>
                <Button size="sm" className="bg-stone-600 hover:bg-stone-700 text-white justify-start">
                  <Phone className="h-4 w-4 mr-2" />
                  Contactar
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
