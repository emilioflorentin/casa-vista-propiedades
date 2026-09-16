import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Home, Key, Zap, Shield, MessageCircle, Camera, ArrowRight, MapPin, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import LocationSearchOverlay from "@/components/LocationSearchOverlay";
import { supabase } from "@/integrations/supabase/client";
import { getLocalProperties } from "@/utils/localProperties";
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchOperation, setSearchOperation] = useState<'sale' | 'rent'>('sale');
  const [searchQuery, setSearchQuery] = useState('');
  const [locationOpen, setLocationOpen] = useState(false);
  const [locationError, setLocationError] = useState(false);
  const [propertyCount, setPropertyCount] = useState(0);

  // Load property count for the stats section
  useEffect(() => {
    const loadPropertyCount = async () => {
      try {
        const { count } = await supabase
          .from("properties")
          .select("*", { count: "exact", head: true })
          .or("is_rented.is.null,is_rented.eq.false"); // Only available properties

        const localProperties = getLocalProperties().filter((prop) => !prop.is_rented);
        setPropertyCount((count || 0) + localProperties.length);
      } catch (error) {
        console.error("Error loading property count:", error);
      }
    };

    loadPropertyCount();
  }, []);

  return (
    <div className="min-h-screen bg-secondary">
      <Header />
      <main>
      {/* Hero Section */}
      <section className="relative bg-primary text-primary-foreground">
        <div className="absolute inset-0 bg-black opacity-5"></div>
        <div className="relative container mx-auto px-6 py-10 text-center md:py-24">
          <Reveal variant="fade">
            <h1 className="text-3xl md:text-6xl font-bold mb-4 md:mb-6 leading-tight">
              {t("hero.title")}
              <span className="block text-primary-foreground">{t("hero.title_highlight")}</span>
            </h1>
          </Reveal>
          <Reveal delay={150}>
            <p className="text-base md:text-2xl mb-6 md:mb-12 text-primary-foreground/90 max-w-3xl mx-auto">{t("hero.subtitle")}</p>
          </Reveal>

          {/* Search Bar */}
          <Reveal delay={280} variant="scale" className="max-w-4xl mx-auto">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                if (!searchQuery.trim()) {
                  setLocationError(true);
                  setLocationOpen(true);
                  return;
                }
                setLocationError(false);
                const params = new URLSearchParams({ operation: searchOperation });
                params.set('q', searchQuery.trim());
                navigate(`/properties?${params.toString()}`);
              }}
            >
              <div className="flex gap-1 px-2">
                {([['sale', 'Comprar'], ['rent', 'Alquilar']] as const).map(([value, label]) => (
                  <Button
                    key={value}
                    type="button"
                    variant={searchOperation === value ? 'secondary' : 'ghost'}
                    onClick={() => setSearchOperation(value)}
                    className={searchOperation === value ? 'rounded-b-none' : 'rounded-b-none text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground'}
                  >
                    {label}
                  </Button>
                ))}
                <Button asChild type="button" variant="ghost" className="rounded-b-none text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                  <Link to="/roomie-finder">Compartir</Link>
                </Button>
              </div>
              <div className="flex flex-col gap-2 bg-card p-2 shadow-xl md:flex-row md:items-start md:gap-3 md:p-3">
                <div className="relative flex-1">
                  <MapPin className="absolute left-4 top-6 h-5 w-5 -translate-y-1/2 text-muted-foreground md:top-7" />
                  <button
                    type="button"
                    onClick={() => { setLocationError(false); setLocationOpen(true); }}
                    className={`h-12 w-full rounded-md bg-secondary pl-12 pr-4 text-left text-base outline-none ring-primary focus:ring-2 md:h-14 ${locationError ? 'ring-2 ring-destructive' : ''} ${searchQuery ? 'text-foreground' : 'text-muted-foreground'}`}
                  >
                    {searchQuery || 'Ciudad, barrio o referencia'}
                  </button>
                  {locationError && (
                    <p className="mt-2 flex items-center gap-2 text-left text-sm font-medium text-destructive">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      Escribe una ubicación donde buscar
                    </p>
                  )}
                </div>
                <Button type="submit" size="lg" className="h-12 px-9 text-base md:h-14">
                  <Search className="h-5 w-5" />
                  Buscar viviendas
                </Button>
              </div>
            </form>
            <LocationSearchOverlay
              open={locationOpen}
              initialValue={searchQuery}
              onClose={() => setLocationOpen(false)}
              onSelect={(value) => {
                setSearchQuery(value.address);
                setLocationOpen(false);
                const params = new URLSearchParams({ operation: searchOperation });
                if (value.address.trim()) params.set('q', value.address.trim());
                if ('lat' in value) {
                  params.set('lat', String(value.lat));
                  params.set('lng', String(value.lng));
                  params.set('radius', String(value.radius));
                  if (value.polygon?.length) {
                    params.set('poly', value.polygon.map(([la, ln]) => `${la.toFixed(5)},${ln.toFixed(5)}`).join(';'));
                  }
                }
                navigate(`/properties?${params.toString()}`);
              }}
            />
          </Reveal>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-10 md:py-16 bg-card">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-8 text-center">
            <Reveal className="p-4 md:p-6">
              <div className="bg-secondary w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 md:w-16 md:h-16 md:mb-4">
                <Home className="h-6 w-6 text-primary md:h-8 md:w-8" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2 md:text-3xl">
                {propertyCount.toLocaleString("es-ES")}+
              </h3>
              <p className="text-muted-foreground">{t("stats.properties")}</p>
            </Reveal>
            <Reveal delay={120} className="p-4 md:p-6">
              <div className="bg-secondary w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 md:w-16 md:h-16 md:mb-4">
                <Key className="h-6 w-6 text-primary md:h-8 md:w-8" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2 md:text-3xl">190+</h3>
              <p className="text-muted-foreground">{t("stats.clients")}</p>
            </Reveal>
            <Reveal delay={240} className="p-4 md:p-6">
              <div className="bg-secondary w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 md:w-16 md:h-16 md:mb-4">
                <Zap className="h-6 w-6 text-primary md:h-8 md:w-8" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2 md:text-3xl">98%</h3>
              <p className="text-muted-foreground">{t("stats.success_rate")}</p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Tenant Section */}
      <section className="py-10 md:py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6">
          <Reveal className="max-w-4xl mx-auto text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-4xl font-bold mb-3 md:mb-4">{t("tenant_section.title")}</h2>
            <p className="text-base md:text-xl text-primary-foreground/80 max-w-2xl mx-auto">{t("tenant_section.subtitle")}</p>
          </Reveal>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-8 max-w-4xl mx-auto mb-8 md:mb-12">
            <Reveal className="text-center p-4 md:p-6">
              <div className="w-12 h-12 bg-card/10 rounded-full flex items-center justify-center mx-auto mb-3 md:w-16 md:h-16 md:mb-4">
                <Shield className="h-6 w-6 text-primary-foreground/80 md:h-8 md:w-8" />
              </div>
              <h3 className="text-base font-semibold mb-1 md:text-lg md:mb-2">{t("tenant_section.step1_title")}</h3>
              <p className="text-primary-foreground/70 text-sm">{t("tenant_section.step1_desc")}</p>
            </Reveal>
            <Reveal delay={120} className="text-center p-4 md:p-6">
              <div className="w-12 h-12 bg-card/10 rounded-full flex items-center justify-center mx-auto mb-3 md:w-16 md:h-16 md:mb-4">
                <Camera className="h-6 w-6 text-primary-foreground/80 md:h-8 md:w-8" />
              </div>
              <h3 className="text-base font-semibold mb-1 md:text-lg md:mb-2">{t("tenant_section.step2_title")}</h3>
              <p className="text-primary-foreground/70 text-sm">{t("tenant_section.step2_desc")}</p>
            </Reveal>
            <Reveal delay={240} className="text-center p-4 md:p-6">
              <div className="w-12 h-12 bg-card/10 rounded-full flex items-center justify-center mx-auto mb-3 md:w-16 md:h-16 md:mb-4">
                <MessageCircle className="h-6 w-6 text-primary-foreground/80 md:h-8 md:w-8" />
              </div>
              <h3 className="text-base font-semibold mb-1 md:text-lg md:mb-2">{t("tenant_section.step3_title")}</h3>
              <p className="text-primary-foreground/70 text-sm">{t("tenant_section.step3_desc")}</p>
            </Reveal>
          </div>

          <Reveal delay={120} className="text-center">
            <Link to="/tenant-incidents">
              <Button size="lg" className="bg-card text-foreground hover:bg-accent/20 font-semibold">
                {t("tenant_section.cta")}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </Reveal>
        </div>
      </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
