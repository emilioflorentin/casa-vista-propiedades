
import { Award, Users, Clock, MapPin, Heart, Target } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const About = () => {
  const values = [
    {
      icon: Heart,
      title: "Compromiso",
      description: "Nos comprometemos al 100% con cada cliente y cada propiedad que gestionamos."
    },
    {
      icon: Target,
      title: "Profesionalidad",
      description: "Aplicamos los más altos estándares de calidad en todos nuestros servicios."
    },
    {
      icon: Users,
      title: "Confianza",
      description: "Construimos relaciones duraderas basadas en la transparencia y honestidad."
    },
    {
      icon: Award,
      title: "Excelencia",
      description: "Buscamos la excelencia en cada detalle para superar las expectativas."
    }
  ];

  const stats = [
    { number: "15+", label: "Años de Experiencia" },
    { number: "1000+", label: "Propiedades Gestionadas" },
    { number: "5000+", label: "Clientes Satisfechos" },
    { number: "98%", label: "Tasa de Satisfacción" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-stone-300 via-stone-400 to-stone-500 text-white">
        <div className="absolute inset-0 bg-black opacity-5"></div>
        <div className="relative container mx-auto px-6 py-24 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Quiénes
            <span className="block text-stone-100">Somos</span>
          </h1>
          <p className="text-xl md:text-2xl mb-12 text-stone-50 max-w-3xl mx-auto">
            Más de 15 años ayudando a encontrar el hogar perfecto en Granada y toda Andalucía
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-800 mb-6">Nuestra Historia</h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                Nazarí Homes nació en 2009 con una visión clara: revolucionar el sector inmobiliario 
                en Granada ofreciendo un servicio personalizado, transparente y de máxima calidad. 
                Comenzamos como una pequeña empresa familiar y hemos crecido hasta convertirnos en 
                una de las inmobiliarias de referencia en Andalucía.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Nuestro nombre rinde homenaje al Reino Nazarí de Granada, reflejando nuestro 
                profundo amor por esta ciudad y nuestro compromiso con su patrimonio arquitectónico 
                y cultural. Cada propiedad que gestionamos es tratada con el mismo cuidado y 
                atención al detalle que caracterizaba a los maestros constructores nazaríes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-stone-50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="p-6">
                <h3 className="text-4xl font-bold text-stone-600 mb-2">{stat.number}</h3>
                <p className="text-gray-600 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Nuestros Valores</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Los principios que guían cada una de nuestras acciones y decisiones
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow border-stone-200">
                <CardHeader>
                  <div className="bg-stone-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <value.icon className="h-8 w-8 text-stone-600" />
                  </div>
                  <CardTitle className="text-xl text-gray-800">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    {value.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-stone-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Nuestro Equipo</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Profesionales apasionados por el sector inmobiliario
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="border-stone-200">
                <CardHeader className="text-center">
                  <div className="w-24 h-24 bg-stone-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Users className="h-12 w-12 text-stone-600" />
                  </div>
                  <CardTitle className="text-xl text-gray-800">Equipo Comercial</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-gray-600">
                    Nuestros agentes comerciales tienen años de experiencia en el mercado local 
                    y conocen cada barrio de Granada como la palma de su mano.
                  </CardDescription>
                </CardContent>
              </Card>
              
              <Card className="border-stone-200">
                <CardHeader className="text-center">
                  <div className="w-24 h-24 bg-stone-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <MapPin className="h-12 w-12 text-stone-600" />
                  </div>
                  <CardTitle className="text-xl text-gray-800">Equipo de Gestión</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-gray-600">
                    Nuestro equipo de gestión se encarga de que todo funcione perfectamente, 
                    desde el mantenimiento hasta la atención al cliente.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-stone-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <h3 className="text-3xl font-bold mb-4">¿Quieres Conocernos Mejor?</h3>
          <p className="text-xl mb-8 text-stone-100">
            Ven a visitarnos a nuestra oficina en Granada o contacta con nosotros
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/contact" 
              className="bg-white text-stone-600 px-8 py-3 rounded-lg font-semibold hover:bg-stone-50 transition-colors"
            >
              Contactar
            </a>
            <div className="flex items-center justify-center text-stone-100">
              <MapPin className="h-5 w-5 mr-2" />
              <span>Calle Real de la Alhambra, 15 - Granada</span>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
