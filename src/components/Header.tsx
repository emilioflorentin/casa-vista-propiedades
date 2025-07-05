
import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Heart, User, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-gradient-to-r from-orange-50 to-red-50 shadow-xl sticky top-0 z-50 border-b-2 border-orange-200">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-24">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-6 group">
            <img 
              src="/lovable-uploads/dcb0aee9-6c77-42b4-ac43-890fb3993d1a.png" 
              alt="Nazarí Homes" 
              className="h-16 w-auto transition-transform duration-300 group-hover:scale-110 drop-shadow-lg"
            />
            <div className="hidden md:block w-px h-12 bg-gradient-to-b from-orange-300 to-red-300"></div>
            <img 
              src="/lovable-uploads/40868b12-4e35-4795-9055-e41aed888525.png" 
              alt="España - Europa" 
              className="h-16 w-auto transition-transform duration-300 group-hover:scale-110 drop-shadow-lg"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-orange-700 hover:text-orange-900 font-semibold text-lg transition-all duration-300 hover:scale-105 relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-1 after:bottom-0 after:left-0 after:bg-gradient-to-r after:from-orange-500 after:to-red-500 after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left">
              Inicio
            </Link>
            <Link to="/properties" className="text-orange-700 hover:text-orange-900 font-semibold text-lg transition-all duration-300 hover:scale-105 relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-1 after:bottom-0 after:left-0 after:bg-gradient-to-r after:from-orange-500 after:to-red-500 after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left">
              Propiedades
            </Link>
            <Link to="/contact" className="text-orange-700 hover:text-orange-900 font-semibold text-lg transition-all duration-300 hover:scale-105 relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-1 after:bottom-0 after:left-0 after:bg-gradient-to-r after:from-orange-500 after:to-red-500 after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left">
              Contacto
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="text-orange-700 hover:text-orange-900 hover:bg-orange-100 transition-all duration-300 hover:scale-105 font-medium">
              <Heart className="h-5 w-5 mr-2 transition-transform duration-300" />
              Favoritos
            </Button>
            <Button variant="ghost" size="sm" className="text-orange-700 hover:text-orange-900 hover:bg-orange-100 transition-all duration-300 hover:scale-105 font-medium">
              <User className="h-5 w-5 mr-2 transition-transform duration-300" />
              Mi Cuenta
            </Button>
            <Button size="sm" className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl shadow-lg">
              <Phone className="h-5 w-5 mr-2 transition-transform duration-300" />
              Contactar
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 transition-transform duration-300 hover:scale-110"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-7 w-7 text-orange-700 transition-transform duration-300" />
            ) : (
              <Menu className="h-7 w-7 text-orange-700 transition-transform duration-300" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t-2 border-orange-200 animate-fade-in bg-gradient-to-b from-orange-50 to-red-50">
            <nav className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className="text-orange-700 hover:text-orange-900 font-semibold text-lg transition-all duration-300 hover:translate-x-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Inicio
              </Link>
              <Link 
                to="/properties" 
                className="text-orange-700 hover:text-orange-900 font-semibold text-lg transition-all duration-300 hover:translate-x-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Propiedades
              </Link>
              <Link 
                to="/contact" 
                className="text-orange-700 hover:text-orange-900 font-semibold text-lg transition-all duration-300 hover:translate-x-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Contacto
              </Link>
              <div className="flex flex-col space-y-3 pt-4 border-t-2 border-orange-200">
                <Button variant="ghost" size="sm" className="justify-start text-orange-700 hover:text-orange-900 hover:bg-orange-100 transition-all duration-300 hover:translate-x-2 font-medium">
                  <Heart className="h-5 w-5 mr-2" />
                  Favoritos
                </Button>
                <Button variant="ghost" size="sm" className="justify-start text-orange-700 hover:text-orange-900 hover:bg-orange-100 transition-all duration-300 hover:translate-x-2 font-medium">
                  <User className="h-5 w-5 mr-2" />
                  Mi Cuenta
                </Button>
                <Button size="sm" className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white justify-start transition-all duration-300 hover:translate-x-2 font-semibold shadow-lg">
                  <Phone className="h-5 w-5 mr-2" />
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
