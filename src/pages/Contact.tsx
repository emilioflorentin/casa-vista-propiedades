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
                    <MessageCircle className="h-5 w-5" />
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
