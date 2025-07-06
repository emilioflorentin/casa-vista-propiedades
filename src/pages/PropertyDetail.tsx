import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Heart, Share2, MapPin, Bed, Bath, Square, Car, Wifi, Tv, Wind, Phone, Mail, Calendar, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { allProperties } from "@/data/properties";

// Agent data for different properties
const agentData = [
  {
    name: "María García",
    phone: "+34 91 123 45 67",
    email: "maria@inmobiliariaapp.com",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b789?w=150&h=150&fit=crop&crop=face"
  },
  {
    name: "Carlos Rodríguez", 
    phone: "+34 91 234 56 78",
    email: "carlos@inmobiliariaapp.com",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
  },
  {
    name: "Ana Martínez",
    phone: "+34 91 345 67 89", 
    email: "ana@inmobiliariaapp.com",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
  },
  {
    name: "Luis González",
    phone: "+34 91 456 78 90",
    email: "luis@inmobiliariaapp.com", 
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face"
  },
  {
    name: "Isabel Fernández",
    phone: "+34 91 567 89 01",
    email: "isabel@inmobiliariaapp.com",
    image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face"
  },
  {
    name: "Roberto Silva",
    phone: "+34 91 678 90 12", 
    email: "roberto@inmobiliariaapp.com",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
  }
];

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });
  const [whatsappMessage, setWhatsappMessage] = useState("");

  // Fixed WhatsApp number for the business
  const WHATSAPP_BUSINESS_NUMBER = "+34912345678";

  const property = allProperties.find(p => p.id === Number(id));

  if (!property) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-stone-800 mb-4">Propiedad no encontrada</h1>
          <Link to="/properties">
            <Button className="bg-stone-600 hover:bg-stone-700">Volver a Propiedades</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Generate multiple images for the property
  const images = [
    property.image,
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=600&fit=crop",
  ];

  // Get agent data (cycle through available agents)
  const agent = agentData[property.id % agentData.length];

  // Generate description based on property type
  const getDescription = (property: any) => {
    const typeDescriptions = {
      apartment: "Hermoso apartamento ubicado en una zona privilegiada. Completamente renovado con acabados de alta calidad y todas las comodidades modernas.",
      house: "Magnífica casa familiar perfecta para disfrutar en familia. Espacios amplios y bien distribuidos con múltiples opciones de entretenimiento.",
      loft: "Impresionante loft de estilo moderno con espacios diáfanos y una decoración contemporánea que combina funcionalidad y estilo.",
      studio: "Acogedor estudio completamente reformado y con mucha luz natural. Perfecto para jóvenes profesionales o estudiantes."
    };
    return typeDescriptions[property.type as keyof typeof typeDescriptions] || "Excelente propiedad en ubicación privilegiada.";
  };

  const amenities = [
    { icon: Wifi, label: "WiFi" },
    { icon: Wind, label: "Aire Acondicionado" }, 
    { icon: Tv, label: "TV" },
    { icon: Car, label: "Parking" }
  ];

  const formatPrice = (price: number, operation: string) => {
    const formattedPrice = new Intl.NumberFormat('es-ES').format(price);
    return operation === 'rent' ? `${formattedPrice}€/mes` : `${formattedPrice}€`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Here you would typically send the form data to your backend
  };

  const handleGoBack = () => {
    navigate(-1); // Goes back to the previous page in history
  };

  const handleWhatsAppChat = () => {
    const defaultMessage = whatsappMessage || `Hola! Estoy interesado en la propiedad "${property.title}" (ID: ${property.id}). Me gustaría agendar una cita para visitarla.`;
    const encodedMessage = encodeURIComponent(defaultMessage);
    const whatsappUrl = `https://wa.me/${WHATSAPP_BUSINESS_NUMBER}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const quickMessages = [
    "Quiero agendar una visita",
    "¿Está disponible esta propiedad?",
    "¿Cuáles son los horarios de visita?",
    "Necesito más información sobre el precio"
  ];

  return (
    <div className="min-h-screen bg-stone-50">
      <Header />
      
      <div className="container mx-auto px-6 py-6">
        {/* Back Button */}
        <button 
          onClick={handleGoBack}
          className="inline-flex items-center text-stone-600 hover:text-stone-700 mb-6 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="relative mb-6">
              <div className="aspect-video rounded-lg overflow-hidden">
                <img
                  src={images[currentImageIndex]}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="grid grid-cols-4 gap-2 mt-4">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`aspect-video rounded-lg overflow-hidden border-2 ${
                      currentImageIndex === index ? "border-stone-500" : "border-transparent"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Vista ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Property Info */}
            <div className="bg-white rounded-lg p-6 mb-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex gap-2 mb-2">
                    <Badge 
                      variant={property.operation === 'rent' ? 'default' : 'secondary'}
                      className={`${
                        property.operation === 'rent' 
                          ? 'bg-stone-500 hover:bg-stone-600' 
                          : 'bg-amber-500 hover:bg-amber-600'
                      } text-white`}
                    >
                      {property.operation === 'rent' ? 'Alquiler' : 'Venta'}
                    </Badge>
                  </div>
                  <h1 className="text-3xl font-bold text-stone-800 mb-2">
                    {property.title}
                  </h1>
                  <div className="flex items-center text-stone-600 mb-4">
                    <MapPin className="h-5 w-5 mr-2" />
                    {property.location}
                  </div>
                  <div className="text-3xl font-bold text-stone-600">
                    {formatPrice(property.price, property.operation)}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="border-stone-300 text-stone-600 hover:bg-stone-50">
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="border-stone-300 text-stone-600 hover:bg-stone-50">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Property Stats */}
              <div className="grid grid-cols-4 gap-4 py-6 border-y border-stone-200">
                <div className="text-center">
                  <Bed className="h-6 w-6 mx-auto text-stone-400 mb-2" />
                  <div className="font-semibold">{property.bedrooms}</div>
                  <div className="text-sm text-stone-600">Habitaciones</div>
                </div>
                <div className="text-center">
                  <Bath className="h-6 w-6 mx-auto text-stone-400 mb-2" />
                  <div className="font-semibold">{property.bathrooms}</div>
                  <div className="text-sm text-stone-600">Baños</div>
                </div>
                <div className="text-center">
                  <Square className="h-6 w-6 mx-auto text-stone-400 mb-2" />
                  <div className="font-semibold">{property.area}m²</div>
                  <div className="text-sm text-stone-600">Superficie</div>
                </div>
                <div className="text-center">
                  <Car className="h-6 w-6 mx-auto text-stone-400 mb-2" />
                  <div className="font-semibold">1</div>
                  <div className="text-sm text-stone-600">Parking</div>
                </div>
              </div>

              {/* Description */}
              <div className="py-6">
                <h2 className="text-xl font-semibold mb-4 text-stone-800">Descripción</h2>
                <p className="text-stone-700 leading-relaxed">
                  {getDescription(property)}
                </p>
              </div>

              {/* Features */}
              {property.features && property.features.length > 0 && (
                <div className="py-6 border-t border-stone-200">
                  <h2 className="text-xl font-semibold mb-4 text-stone-800">Características</h2>
                  <div className="grid grid-cols-2 gap-3">
                    {property.features.map((feature, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-2 h-2 bg-stone-500 rounded-full mr-3"></div>
                        <span className="text-stone-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Amenities */}
              <div className="py-6 border-t border-stone-200">
                <h2 className="text-xl font-semibold mb-4 text-stone-800">Servicios</h2>
                <div className="grid grid-cols-4 gap-4">
                  {amenities.map((amenity, index) => (
                    <div key={index} className="text-center p-3 bg-stone-50 rounded-lg">
                      <amenity.icon className="h-6 w-6 mx-auto text-stone-600 mb-2" />
                      <span className="text-sm text-stone-700">{amenity.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Agent Card */}
            <Card className="border-stone-200">
              <CardHeader>
                <CardTitle className="text-stone-800">Agente Inmobiliario</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center mb-4">
                  <img
                    src={agent.image}
                    alt={agent.name}
                    className="w-16 h-16 rounded-full mr-4"
                  />
                  <div>
                    <h3 className="font-semibold text-lg text-stone-800">{agent.name}</h3>
                    <p className="text-stone-600">Agente Senior</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-3 text-stone-400" />
                    <span className="text-stone-700">{agent.phone}</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-3 text-stone-400" />
                    <span className="text-stone-700">{agent.email}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <Button size="sm" className="bg-stone-600 hover:bg-stone-700">
                    <Phone className="h-4 w-4 mr-1" />
                    Llamar
                  </Button>
                  <Button variant="outline" size="sm" className="border-stone-300 text-stone-600 hover:bg-stone-50">
                    <Calendar className="h-4 w-4 mr-1" />
                    Cita
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* WhatsApp Chat Card */}
            <Card className="border-stone-200">
              <CardHeader>
                <CardTitle className="text-stone-800 flex items-center">
                  <div className="relative mr-2">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.516" fill="#25D366"/>
                    </svg>
                  </div>
                  Chat WhatsApp
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-stone-600 mb-4">
                  Chatea directamente con nosotros para agendar una cita o resolver tus dudas al instante.
                </p>
                
                {/* Quick message buttons */}
                <div className="space-y-2 mb-4">
                  <p className="text-sm font-medium text-stone-700">Mensajes rápidos:</p>
                  {quickMessages.map((message, index) => (
                    <button
                      key={index}
                      onClick={() => setWhatsappMessage(message)}
                      className="w-full text-left p-2 text-sm bg-stone-50 hover:bg-stone-100 rounded-lg transition-colors"
                    >
                      {message}
                    </button>
                  ))}
                </div>

                {/* Custom message input */}
                <div className="space-y-3">
                  <Textarea
                    placeholder="Escribe tu mensaje personalizado..."
                    value={whatsappMessage}
                    onChange={(e) => setWhatsappMessage(e.target.value)}
                    rows={3}
                    className="border-stone-300 focus:border-stone-500 text-sm resize-none"
                  />
                  <Button 
                    onClick={handleWhatsAppChat}
                    className="w-full bg-green-500 hover:bg-green-600 text-white"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Abrir WhatsApp
                  </Button>
                </div>

                <div className="mt-3 p-3 bg-green-50 rounded-lg">
                  <p className="text-xs text-green-700 text-center">
                    📱 Te responderemos en menos de 5 minutos
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Contact Form */}
            <Card className="border-stone-200">
              <CardHeader>
                <CardTitle className="text-stone-800">Solicitar Información</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    name="name"
                    placeholder="Nombre completo"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="border-stone-300 focus:border-stone-500"
                  />
                  <Input
                    name="email"
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="border-stone-300 focus:border-stone-500"
                  />
                  <Input
                    name="phone"
                    type="tel"
                    placeholder="Teléfono"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="border-stone-300 focus:border-stone-500"
                  />
                  <Textarea
                    name="message"
                    placeholder="Mensaje (opcional)"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={4}
                    className="border-stone-300 focus:border-stone-500"
                  />
                  <Button type="submit" className="w-full bg-stone-600 hover:bg-stone-700">
                    Enviar Consulta
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

export default PropertyDetail;
