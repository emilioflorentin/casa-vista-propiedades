
import { Settings, Home, Key, Shield, Clock, Users, Wrench, HardHat } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

const Services = () => {
  const { t } = useLanguage();

  const services = [
    {
      icon: Home,
      title: t('services.management.title'),
      description: t('services.management.description'),
      features: [
        t('services.management.feature1'),
        t('services.management.feature2'),
        t('services.management.feature3'),
        t('services.management.feature4')
      ]
    },
    {
      icon: Key,
      title: t('services.rental.title'),
      description: t('services.rental.description'),
      features: [
        t('services.rental.feature1'),
        t('services.rental.feature2'),
        t('services.rental.feature3'),
        t('services.rental.feature4')
      ]
    },
    {
      icon: HardHat,
      title: t('services.renovation.title'),
      description: t('services.renovation.description'),
      features: [
        t('services.renovation.feature1'),
        t('services.renovation.feature2'),
        t('services.renovation.feature3'),
        t('services.renovation.feature4')
      ]
    },
    {
      icon: Clock,
      title: t('services.support.title'),
      description: t('services.support.description'),
      features: [
        t('services.support.feature1'),
        t('services.support.feature2'),
        t('services.support.feature3'),
        t('services.support.feature4')
      ]
    },
    {
      icon: Users,
      title: t('services.tenants.title'),
      description: t('services.tenants.description'),
      features: [
        t('services.tenants.feature1'),
        t('services.tenants.feature2'),
        t('services.tenants.feature3'),
        t('services.tenants.feature4')
      ]
    },
    {
      icon: Wrench,
      title: t('services.maintenance.title'),
      description: t('services.maintenance.description'),
      features: [
        t('services.maintenance.feature1'),
        t('services.maintenance.feature2'),
        t('services.maintenance.feature3'),
        t('services.maintenance.feature4')
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-secondary">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-primary text-primary-foreground">
        <div className="absolute inset-0 bg-black opacity-5"></div>
        <div className="relative container mx-auto px-6 py-24 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            {t('services.title')}
            <span className="block text-primary-foreground">{t('services.title_highlight')}</span>
          </h1>
          <p className="text-xl md:text-2xl mb-12 text-primary-foreground/90 max-w-3xl mx-auto">
            {t('services.subtitle')}
          </p>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              {t('services.what_can_we_do')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('services.what_can_we_do_desc')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow border-border">
                <CardHeader>
                  <div className="bg-secondary w-16 h-16 rounded-full flex items-center justify-center mb-4">
                    <service.icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl text-foreground">{service.title}</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-muted-foreground">
                        <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
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
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 text-center">
          <h3 className="text-3xl font-bold mb-4">{t('services.cta.title')}</h3>
          <p className="text-xl mb-8 text-primary-foreground">
            {t('services.cta.description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/contact" 
              className="bg-card text-primary px-8 py-3 rounded-lg font-semibold hover:bg-secondary transition-colors"
            >
              {t('services.cta.contact_now')}
            </a>
            <a 
              href="tel:+34958123456" 
              className="border-2 border-primary-foreground text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-card hover:text-primary transition-colors"
            >
              {t('services.cta.call_directly')}
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Services;
