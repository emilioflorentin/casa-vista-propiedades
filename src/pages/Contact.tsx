import React, { useState, useRef } from 'react';
import { MapPin, Mail, Phone, MessageCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MapComponent from '@/components/MapComponent';
import { useLanguage } from '@/contexts/LanguageContext';
import HCaptcha from '@hcaptcha/react-hcaptcha';

const Contact = () => {
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [showPrivacyError, setShowPrivacyError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    propertyAddress: '',
    name: '',
    surname: '',
    email: '',
    phone: '',
    message: ''
  });
  const { toast } = useToast();
  const { t } = useLanguage();
  const hcaptchaRef = useRef<HCaptcha>(null);

  // Replace with your actual hCaptcha site key
  const HCAPTCHA_SITE_KEY = "10000000-ffff-ffff-ffff-000000000001"; // This is a test key, replace with your actual key

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Verificar si se ha aceptado la política de privacidad
    if (!privacyAccepted) {
      setShowPrivacyError(true);
      return;
    }
    
    // Verificar hCaptcha
    const hcaptchaValue = hcaptchaRef.current?.getResponse();
    if (!hcaptchaValue) {
      toast({
        title: "Error",
        description: "Por favor, completa el hCaptcha para continuar.",
        variant: "destructive"
      });
      return;
    }
    
    setShowPrivacyError(false);
    setIsSubmitting(true);
    
    try {
      // Preparar datos para Formsubmit
      const formDataToSend = new FormData();
      formDataToSend.append('Dirección del inmueble', formData.propertyAddress);
      formDataToSend.append('Nombre', formData.name);
      formDataToSend.append('Apellidos', formData.surname);
      formDataToSend.append('Email', formData.email);
      formDataToSend.append('Teléfono', formData.phone);
      formDataToSend.append('Mensaje', formData.message);
      formDataToSend.append('h-captcha-response', hcaptchaValue);
      
      // Replace 'your-email@example.com' with your actual email
      const response = await fetch('https://formsubmit.co/nazarihomesgranada@gmail.com', {
        method: 'POST',
        body: formDataToSend
      });

      if (response.ok) {
        toast({
          title: t('contact.form_sent'),
          description: t('contact.form_sent_desc'),
        });
        
        // Reset form
        setFormData({
          propertyAddress: '',
          name: '',
          surname: '',
          email: '',
          phone: '',
          message: ''
        });
        setPrivacyAccepted(false);
        hcaptchaRef.current?.resetCaptcha();
      } else {
        throw new Error('Error al enviar el formulario');
      }
    } catch (error) {
      console.error('Error sending form:', error);
      toast({
        title: "Error",
        description: "Hubo un problema al enviar el formulario. Por favor, inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppClick = () => {
    // Abre WhatsApp con un mensaje predefinido
    const phoneNumber = '34650499177'; // Formato internacional sin +
    const message = encodeURIComponent(t('contact.whatsapp_message'));
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  const handlePhoneCall = (phoneNumber: string) => {
    window.open(`tel:${phoneNumber}`, '_self');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100">
      <Header />
      
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-stone-300 via-stone-400 to-stone-500 text-white py-20">
        <div className="absolute inset-0 bg-black opacity-5"></div>
        <div className="relative container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">{t('contact.title')}</h1>
          <p className="text-xl text-stone-50">{t('contact.subtitle')}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Mapa */}
          <div className="space-y-6">
            <div className="h-96">
              <MapComponent 
                location="Granada, España" 
                title={t('contact.operation_area')}
              />
            </div>
            
            {/* Información de contacto */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center space-x-3 text-stone-600">
                  <Mail className="h-5 w-5" />
                  <a 
                    href="mailto:nazarihomesgranada@gmail.com"
                    className="font-medium hover:text-stone-800 transition-colors"
                  >
                    nazarihomesgranada@gmail.com
                  </a>
                </div>
                
                <button
                  onClick={() => handlePhoneCall('958467433')}
                  className="flex items-center space-x-3 text-stone-600 hover:text-stone-800 transition-colors"
                >
                  <Phone className="h-5 w-5" />
                  <span className="font-medium">958 467 433</span>
                </button>
                
                <button
                  onClick={() => handlePhoneCall('650499177')}
                  className="flex items-center space-x-3 text-stone-600 hover:text-stone-800 transition-colors"
                >
                  <Phone className="h-5 w-5" />
                  <span className="font-medium">650 499 177</span>
                </button>

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
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                    </svg>
                    <div className="text-left">
                      <p className="font-medium">{t('contact.whatsapp_text')}</p>
                      <p className="text-sm text-green-600">650 499 177</p>
                    </div>
                  </button>
                </div>
                
                <div className="flex items-start space-x-3 text-stone-600">
                  <MapPin className="h-5 w-5 mt-1" />
                  <div>
                    <p className="font-medium">{t('contact.operation_zone')}</p>
                    <p className="text-stone-600">{t('contact.granada_province')}</p>
                    <p className="text-stone-500 text-sm mt-1">
                      {t('contact.no_physical_office')}
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
                    {t('contact.form_title')}
                  </h2>
                  <p className="text-stone-600 text-lg font-medium">
                    {t('contact.form_subtitle')}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                  <div>
                    <Input
                      name="propertyAddress"
                      value={formData.propertyAddress}
                      onChange={handleInputChange}
                      placeholder={t('contact.property_address')}
                      className="w-full h-12 text-base"
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder={t('contact.name')}
                      className="h-12 text-base"
                      required
                    />
                    <Input
                      name="surname"
                      value={formData.surname}
                      onChange={handleInputChange}
                      placeholder={t('contact.surname')}
                      className="h-12 text-base"
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder={t('contact.email')}
                      className="h-12 text-base"
                      required
                    />
                    <Input
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder={t('contact.phone')}
                      className="h-12 text-base"
                      required
                    />
                  </div>

                  <div>
                    <Textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder={t('contact.message')}
                      className="min-h-[100px] text-base"
                      rows={4}
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start space-x-2">
                      <input
                        type="checkbox"
                        id="privacy"
                        className="mt-1"
                        checked={privacyAccepted}
                        onChange={(e) => {
                          setPrivacyAccepted(e.target.checked);
                          if (e.target.checked) {
                            setShowPrivacyError(false);
                          }
                        }}
                        required
                      />
                      <label htmlFor="privacy" className="text-sm text-stone-600">
                        {t('contact.privacy_text')}{' '}
                        <Link 
                          to="/privacy-policy" 
                          className="text-stone-600 hover:underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {t('contact.privacy_policy')}
                        </Link>
                      </label>
                    </div>

                    {showPrivacyError && (
                      <Alert variant="destructive">
                        <AlertDescription>
                          {t('contact.privacy_error')}
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* hCaptcha */}
                    <div className="flex justify-center">
                      <HCaptcha
                        ref={hcaptchaRef}
                        sitekey={HCAPTCHA_SITE_KEY}
                        theme="light"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 text-lg font-semibold bg-stone-600 hover:bg-stone-700 text-white"
                    disabled={!privacyAccepted || isSubmitting}
                  >
                    {isSubmitting ? 'Enviando...' : t('contact.send_button')}
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
