
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-stone-900 text-white">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center">
              <img 
                src="/lovable-uploads/dcb0aee9-6c77-42b4-ac43-890fb3993d1a.png" 
                alt="Nazarí Homes" 
                className="h-12 w-auto brightness-0 invert"
              />
            </Link>
            <p className="text-stone-400 leading-relaxed">
              Tu partner de confianza para encontrar la propiedad perfecta. 
              Más de 10 años de experiencia en el sector inmobiliario.
            </p>
            <div className="flex space-x-4">
              <Facebook className="h-5 w-5 text-stone-400 hover:text-stone-200 cursor-pointer transition-colors" />
              <Twitter className="h-5 w-5 text-stone-400 hover:text-stone-200 cursor-pointer transition-colors" />
              <Instagram className="h-5 w-5 text-stone-400 hover:text-stone-200 cursor-pointer transition-colors" />
              <Linkedin className="h-5 w-5 text-stone-400 hover:text-stone-200 cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-stone-400 hover:text-white transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link to="/properties" className="text-stone-400 hover:text-white transition-colors">
                  Propiedades
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-stone-400 hover:text-white transition-colors">
                  Contacto
                </Link>
              </li>
              <li>
                <a href="#" className="text-stone-400 hover:text-white transition-colors">
                  Sobre Nosotros
                </a>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Servicios</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-stone-400 hover:text-white transition-colors">
                  Alquiler de Propiedades
                </a>
              </li>
              <li>
                <a href="#" className="text-stone-stone-400 hover:text-white transition-colors">
                  Venta de Propiedades
                </a>
              </li>
              <li>
                <a href="#" className="text-stone-400 hover:text-white transition-colors">
                  Tasación Gratuita
                </a>
              </li>
              <li>
                <a href="#" className="text-stone-400 hover:text-white transition-colors">
                  Asesoría Legal
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contacto</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-stone-400" />
                <span className="text-stone-400">
                  Calle Gran Vía 123, Madrid
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-stone-400" />
                <span className="text-stone-400">
                  +34 91 123 45 67
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-stone-400" />
                <span className="text-stone-400">
                  info@nazarihomes.com
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-stone-800 mt-12 pt-8 text-center">
          <p className="text-stone-400">
            © 2024 Nazarí Homes. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
