
import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Heart, User, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/hooks/useFavorites";
import { useLanguage } from "@/contexts/LanguageContext";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { favorites } = useFavorites();
  const { language, setLanguage, t } = useLanguage();

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
              {t('nav.home')}
            </Link>
            <Link to="/properties" className="text-gray-700 hover:text-stone-700 font-medium transition-colors">
              {t('nav.properties')}
            </Link>
            <Link to="/services" className="text-gray-700 hover:text-stone-700 font-medium transition-colors">
              {t('nav.services')}
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-stone-700 font-medium transition-colors">
              {t('nav.about')}
            </Link>
            <Link to="/contact" className="text-gray-700 hover:text-stone-700 font-medium transition-colors">
              {t('nav.contact')}
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/favorites">
              <Button variant="ghost" size="sm" className="text-gray-700 hover:text-stone-700 hover:bg-stone-50 relative">
                <Heart className="h-4 w-4 mr-2" />
                {t('nav.favorites')}
                {favorites.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {favorites.length}
                  </span>
                )}
              </Button>
            </Link>
            <Button variant="ghost" size="sm" className="text-gray-700 hover:text-stone-700 hover:bg-stone-50">
              <User className="h-4 w-4 mr-2" />
              {t('nav.account')}
            </Button>
            <Link to="/contact">
              <Button size="sm" className="bg-stone-600 hover:bg-stone-700 text-white">
                <Phone className="h-4 w-4 mr-2" />
                {t('nav.contact_btn')}
              </Button>
            </Link>
            
            {/* Language Flags */}
            <div className="flex items-center space-x-2 ml-4 border-l border-stone-200 pl-4">
              <button
                onClick={() => setLanguage('es')}
                className={`w-8 h-6 rounded overflow-hidden transition-all duration-200 hover:scale-110 ${
                  language === 'es' ? 'ring-2 ring-stone-600' : 'opacity-70 hover:opacity-100'
                }`}
                title="Español"
              >
                <div className="w-full h-full bg-gradient-to-b from-red-500 via-yellow-400 to-red-500 flex items-center justify-center">
                  <div className="w-full h-1/3 bg-red-500"></div>
                  <div className="w-full h-1/3 bg-yellow-400"></div>
                  <div className="w-full h-1/3 bg-red-500"></div>
                </div>
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`w-8 h-6 rounded overflow-hidden transition-all duration-200 hover:scale-110 ${
                  language === 'en' ? 'ring-2 ring-stone-600' : 'opacity-70 hover:opacity-100'
                }`}
                title="English"
              >
                <div className="w-full h-full relative bg-blue-600">
                  <div className="absolute inset-0 bg-blue-600"></div>
                  <div className="absolute inset-0 bg-white clip-path-[polygon(0_0,100%_0,0_100%)]"></div>
                  <div className="absolute inset-0 bg-red-500 clip-path-[polygon(100%_0,100%_100%,0_100%)]"></div>
                  <div className="absolute inset-0 bg-white w-1/5 left-0"></div>
                  <div className="absolute inset-0 bg-white h-1/5 top-2/5"></div>
                  <div className="absolute inset-0 bg-red-500 w-1/12 left-1/12"></div>
                  <div className="absolute inset-0 bg-red-500 h-1/12 top-5/12"></div>
                </div>
              </button>
            </div>
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
                {t('nav.home')}
              </Link>
              <Link 
                to="/properties" 
                className="text-gray-700 hover:text-stone-700 font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('nav.properties')}
              </Link>
              <Link 
                to="/services" 
                className="text-gray-700 hover:text-stone-700 font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('nav.services')}
              </Link>
              <Link 
                to="/about" 
                className="text-gray-700 hover:text-stone-700 font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('nav.about')}
              </Link>
              <Link 
                to="/contact" 
                className="text-gray-700 hover:text-stone-700 font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('nav.contact')}
              </Link>
              
              {/* Mobile Language Flags */}
              <div className="flex items-center space-x-3 pt-2">
                <span className="text-sm text-gray-600">Idioma:</span>
                <button
                  onClick={() => {
                    setLanguage('es');
                    setIsMenuOpen(false);
                  }}
                  className={`w-8 h-6 rounded overflow-hidden transition-all duration-200 ${
                    language === 'es' ? 'ring-2 ring-stone-600' : 'opacity-70'
                  }`}
                  title="Español"
                >
                  <div className="w-full h-full bg-gradient-to-b from-red-500 via-yellow-400 to-red-500"></div>
                </button>
                <button
                  onClick={() => {
                    setLanguage('en');
                    setIsMenuOpen(false);
                  }}
                  className={`w-8 h-6 rounded overflow-hidden transition-all duration-200 ${
                    language === 'en' ? 'ring-2 ring-stone-600' : 'opacity-70'
                  }`}
                  title="English"
                >
                  <div className="w-full h-full bg-blue-600 relative">
                    <div className="absolute inset-0 bg-white w-1/3"></div>
                    <div className="absolute inset-0 bg-red-500 w-1/3 right-0"></div>
                  </div>
                </button>
              </div>
              
              <div className="flex flex-col space-y-2 pt-4 border-t border-stone-200">
                <Link to="/favorites" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="ghost" size="sm" className="justify-start text-gray-700 hover:text-stone-700 hover:bg-stone-50 w-full relative">
                    <Heart className="h-4 w-4 mr-2" />
                    {t('nav.favorites')}
                    {favorites.length > 0 && (
                      <span className="absolute right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {favorites.length}
                      </span>
                    )}
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" className="justify-start text-gray-700 hover:text-stone-700 hover:bg-stone-50">
                  <User className="h-4 w-4 mr-2" />
                  {t('nav.account')}
                </Button>
                <Link to="/contact" onClick={() => setIsMenuOpen(false)}>
                  <Button size="sm" className="bg-stone-600 hover:bg-stone-700 text-white justify-start">
                    <Phone className="h-4 w-4 mr-2" />
                    {t('nav.contact_btn')}
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
