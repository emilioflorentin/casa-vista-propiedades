
import React from 'react';
import { MapPin, Mail, Phone, MessageCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MapComponent from '@/components/MapComponent';

const Contact = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí se manejaría el envío del formulario
    console.log('Formulario enviado');
  };

  const handleWhatsAppClick = () => {
    // Abre WhatsApp con un mensaje predefinido
    const phoneNumber = '34650499177'; // Formato internacional sin +
    const message = encodeURIComponent('Hola, me gustaría información sobre sus servicios inmobiliarios.');
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100">
      <Header />
      
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-stone-300 via-stone-400 to-stone-500 text-white py-20">
        <div className="absolute inset-0 bg-black opacity-5"></div>
        <div className="relative container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">Contacto</h1>
          <p className="text-xl text-stone-50">Estamos aquí para ayudarte con todas tus necesidades inmobiliarias</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Mapa */}
          <div className="space-y-6">
            <div className="h-96">
              <MapComponent 
                location="Granada, España" 
                title="Nuestra zona de operación en Granada"
              />
            </div>
            
            {/* Información de contacto */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center space-x-3 text-stone-600">
                  <Mail className="h-5 w-5" />
                  <span className="font-medium">info@inmobiliaria.com</span>
                </div>
                
                <div className="flex items-center space-x-3 text-stone-600">
                  <Phone className="h-5 w-5" />
                  <span className="font-medium">958 467 433</span>
                </div>
                
                <div className="flex items-center space-x-3 text-stone-600">
                  <Phone className="h-5 w-5" />
                  <span className="font-medium">650 499 177</span>
                </div>

                {/* Sección de WhatsApp */}
                <div className="border-t pt-4 mt-4">
                  <button
                    onClick={handleWhatsAppClick}
                    className="flex items-center space-x-3 text-green-600 hover:text-green-700 transition-colors w-full p-3 bg-green-50 hover:bg-green-100 rounded-lg"
                  >
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2zm5.25 7.24c-.22-.64-1.08-1.26-1.63-1.26-.55 0-1.26.38-1.58.89-.32.51-.32 1.33.06 1.84.38.51 1.01.89 1.58.89.95 0 1.77-.76 1.77-1.77 0-.32-.06-.51-.2-.59zm-1.58 6.27c-.57 0-1.14-.19-1.58-.51-.44-.32-.76-.76-.95-1.26-.19-.51-.19-1.08 0-1.58.19-.51.51-.95.95-1.26.44-.32 1.01-.51 1.58-.51.95 0 1.77.76 1.77 1.77 0 .32-.06.63-.13.89-.06.25-.19.44-.38.57-.19.13-.44.19-.7.19zm-3.73-3.16c0-.51-.19-1.01-.51-1.39-.32-.38-.76-.63-1.26-.63-.89 0-1.58.63-1.89 1.52-.32.89-.19 1.84.32 2.6.51.76 1.26 1.26 2.15 1.26.89 0 1.58-.51 1.89-1.39.32-.89.19-1.84-.32-2.6-.51-.76-1.26-1.26-2.15-1.26z"/>
                    </svg>
                    <div className="text-left">
                      <p className="font-medium">¡Escríbenos por WhatsApp!</p>
                      <p className="text-sm text-green-600">650 499 177</p>
                    </div>
                  </button>
                </div>
                
                <div className="flex items-start space-x-3 text-stone-600">
                  <MapPin className="h-5 w-5 mt-1" />
                  <div>
                    <p className="font-medium">Zona de actuación:</p>
                    <p className="text-stone-600">Granada y provincia</p>
                    <p className="text-stone-500 text-sm mt-1">
                      *Trabajamos por toda Granada sin oficina física
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Formulario */}
          <div>
            <Card>
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-stone-800 mb-4">
                    Deja tus datos y te llamamos
                  </h2>
                  <p className="text-stone-600 text-lg font-medium">
                    ¡Obtenga tu valoración gratuita sin compromiso!
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Input
                      placeholder="Dirección del inmueble"
                      className="w-full h-12 text-base"
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                      placeholder="Nombre"
                      className="h-12 text-base"
                      required
                    />
                    <Input
                      placeholder="Apellidos"
                      className="h-12 text-base"
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                      type="email"
                      placeholder="Correo electrónico"
                      className="h-12 text-base"
                      required
                    />
                    <Input
                      type="tel"
                      placeholder="Teléfono"
                      className="h-12 text-base"
                      required
                    />
                  </div>

                  <div>
                    <Textarea
                      placeholder="Mensaje (opcional)"
                      className="min-h-[100px] text-base"
                      rows={4}
                    />
                  </div>

                  <div className="flex items-start space-x-2">
                    <input
                      type="checkbox"
                      id="privacy"
                      className="mt-1"
                      required
                    />
                    <label htmlFor="privacy" className="text-sm text-stone-600">
                      He leído y acepto la{' '}
                      <a href="#" className="text-stone-600 hover:underline">
                        Política de privacidad
                      </a>
                    </label>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 text-lg font-semibold bg-stone-600 hover:bg-stone-700 text-white"
                  >
                    Enviar
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Contact;
