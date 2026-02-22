
import { Award, Users, Clock, MapPin, Heart, Target, Wrench, HardHat } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

const About = () => {
  const { t } = useLanguage();

  const values = [
    {
      icon: Heart,
      title: t('about.commitment.title'),
      description: t('about.commitment.description')
    },
    {
      icon: Target,
      title: t('about.professionalism.title'),
      description: t('about.professionalism.description')
    },
    {
      icon: Users,
      title: t('about.trust.title'),
      description: t('about.trust.description')
    },
    {
      icon: Award,
      title: t('about.excellence.title'),
      description: t('about.excellence.description')
    }
  ];

  const stats = [
    { number: "15+", label: t('about.stats.years') },
    { number: "1000+", label: t('about.stats.properties') },
    { number: "5000+", label: t('about.stats.clients') },
    { number: "98%", label: t('about.stats.satisfaction') }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-stone-300 via-stone-400 to-stone-500 text-white">
        <div className="absolute inset-0 bg-black opacity-5"></div>
        <div className="relative container mx-auto px-6 py-24 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            {t('about.title')}
            <span className="block text-stone-100">{t('about.title_highlight')}</span>
          </h1>
          <p className="text-xl md:text-2xl mb-12 text-stone-50 max-w-3xl mx-auto">
            {t('about.subtitle')}
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-800 mb-6">{t('about.our_story')}</h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                {t('about.story_p1')}
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                {t('about.story_p2')}
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
            <h2 className="text-4xl font-bold text-gray-800 mb-4">{t('about.our_values')}</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('about.values_desc')}
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
            <h2 className="text-4xl font-bold text-gray-800 mb-4">{t('about.our_team')}</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('about.team_desc')}
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="border-stone-200">
                <CardHeader className="text-center">
                  <div className="w-24 h-24 bg-stone-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Users className="h-12 w-12 text-stone-600" />
                  </div>
                  <CardTitle className="text-xl text-gray-800">{t('about.sales_team.title')}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-gray-600">
                    {t('about.sales_team.description')}
                  </CardDescription>
                </CardContent>
              </Card>
              
              <Card className="border-stone-200">
                <CardHeader className="text-center">
                  <div className="w-24 h-24 bg-stone-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <MapPin className="h-12 w-12 text-stone-600" />
                  </div>
                  <CardTitle className="text-xl text-gray-800">{t('about.management_team.title')}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-gray-600">
                    {t('about.management_team.description')}
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-stone-200">
                <CardHeader className="text-center">
                  <div className="w-24 h-24 bg-stone-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Wrench className="h-12 w-12 text-stone-600" />
                  </div>
                  <CardTitle className="text-xl text-gray-800">{t('about.maintenance_team.title')}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-gray-600">
                    {t('about.maintenance_team.description')}
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-stone-200">
                <CardHeader className="text-center">
                  <div className="w-24 h-24 bg-stone-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <HardHat className="h-12 w-12 text-stone-600" />
                  </div>
                  <CardTitle className="text-xl text-gray-800">{t('about.renovation_team.title')}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-gray-600">
                    {t('about.renovation_team.description')}
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
          <h3 className="text-3xl font-bold mb-4">{t('about.cta.title')}</h3>
          <p className="text-xl mb-8 text-stone-100">
            {t('about.cta.description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/contact" 
              className="bg-white text-stone-600 px-8 py-3 rounded-lg font-semibold hover:bg-stone-50 transition-colors"
            >
              {t('about.cta.contact')}
            </a>
            <div className="flex items-center justify-center text-stone-100">
              <MapPin className="h-5 w-5 mr-2" />
              <span>{t('about.cta.address')}</span>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
