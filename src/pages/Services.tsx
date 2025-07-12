
import { Settings, Home, Key, Shield, Clock, Users, Wrench, FileText } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Services = () => {
  const services = [
    {
      icon: Home,
      title: "Gestión Inmobiliaria Integral",
      description: "Administramos tu propiedad de manera completa, desde el marketing hasta la entrega de llaves.",
      features: ["Marketing profesional", "Selección de inquilinos", "Gestión de contratos", "Mantenimiento"]
    },
    {
      icon: Key,
      title: "Alquiler y Venta",
      description: "Servicios especializados tanto para alquiler como venta de propiedades residenciales y comerciales.",
      features: ["Valoración gratuita", "Fotografía profesional", "Publicación en portales", "Visitas guiadas"]
    },
    {
      icon: Shield,
      title: "Asesoramiento Legal",
      description: "Te acompañamos en todos los aspectos legales de tu transacción inmobiliaria.",
      features: ["Revisión de contratos", "Gestión de documentos", "Asesoría fiscal", "Tramitación legal"]
    },
    {
      icon: Clock,
      title: "Atención 24/7",
      description: "Nuestro equipo está disponible para resolver cualquier incidencia en cualquier momento.",
      features: ["Soporte continuo", "Emergencias", "Comunicación directa", "Respuesta inmediata"]
    },
    {
      icon: Users,
      title: "Gestión de Inquilinos",
      description: "Nos encargamos de toda la relación con los inquilinos para que no tengas que preocuparte.",
      features: ["Selección rigurosa", "Cobro de rentas", "Resolución de incidencias", "Comunicación directa"]
    },
    {
      icon: Wrench,
      title: "Mantenimiento y Reformas",
      description: "Mantenemos tu propiedad en perfecto estado con nuestro equipo de profesionales.",
      features: ["Mantenimiento preventivo", "Reparaciones urgentes", "Reformas integrales", "Control de calidad"]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-stone-300 via-stone-400 to-stone-500 text-white">
        <div className="absolute inset-0 bg-black opacity-5"></div>
        <div className="relative container mx-auto px-6 py-24 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Nuestros
            <span className="block text-stone-100">Servicios</span>
          </h1>
          <p className="text-xl md:text-2xl mb-12 text-stone-50 max-w-3xl mx-auto">
            Ofrecemos una gama completa de servicios inmobiliarios para hacer que tu experiencia sea perfecta
          </p>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              ¿Qué Podemos Hacer por Ti?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Desde la gestión completa hasta servicios específicos, adaptamos nuestros servicios a tus necesidades
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow border-stone-200">
                <CardHeader>
                  <div className="bg-stone-50 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                    <service.icon className="h-8 w-8 text-stone-600" />
                  </div>
                  <CardTitle className="text-xl text-gray-800">{service.title}</CardTitle>
                  <CardDescription className="text-gray-600">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-gray-600">
                        <div className="w-2 h-2 bg-stone-600 rounded-full mr-3"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-stone-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <h3 className="text-3xl font-bold mb-4">¿Listo para Empezar?</h3>
          <p className="text-xl mb-8 text-stone-100">
            Contacta con nosotros y descubre cómo podemos ayudarte con tu propiedad
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/contact" 
              className="bg-white text-stone-600 px-8 py-3 rounded-lg font-semibold hover:bg-stone-50 transition-colors"
            >
              Contactar Ahora
            </a>
            <a 
              href="tel:+34958123456" 
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-stone-600 transition-colors"
            >
              Llamar Directamente
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Services;
