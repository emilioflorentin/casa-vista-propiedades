import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Heart, Share2, MapPin, Bed, Bath, Square, Car, Wifi, Tv, Wind, Phone, Mail, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const propertyData = {
  1: {
    id: 1,
    title: "Apartamento Moderno en el Centro",
    type: "apartment",
    price: 1200,
    currency: "€",
    operation: "rent" as const,
    location: "Madrid Centro",
    bedrooms: 2,
    bathrooms: 2,
    area: 85,
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=600&fit=crop",
    ],
    description: "Hermoso apartamento moderno ubicado en el corazón de Madrid. Completamente renovado con acabados de alta calidad, cocina equipada y amplia terraza con vistas a la ciudad. Perfecto para parejas o profesionales que buscan comodidad y ubicación privilegiada.",
    features: [
      "Totalmente amueblado",
      "Cocina equipada",
      "Aire acondicionado",
      "Calefacción central",
      "Terraza privada",
      "Ascensor",
      "Portero automático",
      "Internet fibra óptica"
    ],
    amenities: [
      { icon: Wifi, label: "WiFi" },
      { icon: Wind, label: "Aire Acondicionado" },
      { icon: Tv, label: "TV" },
      { icon: Car, label: "Parking" }
    ],
    agent: {
      name: "María García",
      phone: "+34 91 123 45 67",
      email: "maria@inmobiliariaapp.com",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b789?w=150&h=150&fit=crop&crop=face"
    }
  }
};

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

  const property = propertyData[1]; // For demo, using property 1

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
                  src={property.images[currentImageIndex]}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="grid grid-cols-4 gap-2 mt-4">
                {property.images.map((image, index) => (
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
                  {property.description}
                </p>
              </div>

              {/* Features */}
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

              {/* Amenities */}
              <div className="py-6 border-t border-stone-200">
                <h2 className="text-xl font-semibold mb-4 text-stone-800">Servicios</h2>
                <div className="grid grid-cols-4 gap-4">
                  {property.amenities.map((amenity, index) => (
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
                    src={property.agent.image}
                    alt={property.agent.name}
                    className="w-16 h-16 rounded-full mr-4"
                  />
                  <div>
                    <h3 className="font-semibold text-lg text-stone-800">{property.agent.name}</h3>
                    <p className="text-stone-600">Agente Senior</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-3 text-stone-400" />
                    <span className="text-stone-700">{property.agent.phone}</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-3 text-stone-400" />
                    <span className="text-stone-700">{property.agent.email}</span>
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
