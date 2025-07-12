
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Mail, Phone, MapPin } from 'lucide-react';
import MapComponent from '@/components/MapComponent';
import { useToast } from '@/hooks/use-toast';

const Contact = () => {
  const [formData, setFormData] = useState({
    propertyAddress: '',
    name: '',
    lastName: '',
    email: '',
    phone: '',
    acceptPrivacy: false
  });
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.acceptPrivacy) {
      toast({
        title: "Error",
        description: "Debes aceptar la política de privacidad",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Mensaje enviado",
      description: "Te contactaremos pronto para tu valoración gratuita",
    });

    // Reset form
    setFormData({
      propertyAddress: '',
      name: '',
      lastName: '',
      email: '',
      phone: '',
      acceptPrivacy: false
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-64 bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/20"></div>
        <h1 className="relative text-4xl md:text-5xl font-bold text-white text-center">
          Contacto
        </h1>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Map and Contact Info */}
          <div className="space-y-8">
            {/* Map */}
            <div className="h-96">
              <MapComponent 
                location="Granada, España" 
                title="Nuestra área de trabajo"
              />
            </div>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-primary">Información de contacto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-3 text-muted-foreground">
                  <Mail className="h-5 w-5 text-primary" />
                  <span>info@granahidal.com</span>
                </div>
                
                <div className="flex items-center space-x-3 text-muted-foreground">
                  <Phone className="h-5 w-5 text-primary" />
                  <div className="space-y-1">
                    <div>958 467 433</div>
                    <div>650 499 177</div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 text-muted-foreground">
                  <MapPin className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <div className="font-medium text-foreground">Área de trabajo</div>
                    <div>Granada y provincia</div>
                    <div className="text-sm mt-1">Servicios sin oficina física - Nos desplazamos a tu ubicación</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-primary">
                Deja tus datos y te llamamos
              </CardTitle>
              <p className="text-lg text-blue-500 font-medium">
                ¡Obtenga tu valoración gratuita sin compromiso!
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="propertyAddress">Dirección del inmueble</Label>
                  <Input
                    id="propertyAddress"
                    name="propertyAddress"
                    value={formData.propertyAddress}
                    onChange={handleInputChange}
                    placeholder="Introduce la dirección de tu propiedad"
                    required
                    className="mt-1"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nombre</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Tu nombre"
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Apellidos</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Tus apellidos"
                      required
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Correo electrónico</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="tu@email.com"
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Tu número de teléfono"
                      required
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    id="acceptPrivacy"
                    name="acceptPrivacy"
                    checked={formData.acceptPrivacy}
                    onChange={handleInputChange}
                    className="mt-1 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    required
                  />
                  <Label htmlFor="acceptPrivacy" className="text-sm leading-5">
                    He leído y acepto la{' '}
                    <a href="#" className="text-primary hover:underline">
                      Política de privacidad
                    </a>
                  </Label>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3"
                >
                  Enviar
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Contact;
