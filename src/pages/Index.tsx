import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Home, Key, Zap, Shield, MessageCircle, Camera, ArrowRight, MapPin, AlertCircle, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import LocationSearchOverlay from "@/components/LocationSearchOverlay";
import PropertyCard from "@/components/PropertyCard";
import { supabase } from "@/integrations/supabase/client";
import { getLocalProperties } from "@/utils/localProperties";
import { calculateDistance } from "@/utils/distanceCalculator";
import { useLanguage } from "@/contexts/LanguageContext";

interface FeaturedProperty {
  id: number;
  originalId?: string;
  reference: string;
  title: string;
  type: string;
  price: number;
  currency: string;
  operation: "rent" | "sale";
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  image: string;
  features?: string[];
  managedBy: "nazari" | "other";
  distanceKm: number | null;
}

const Index = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchOperation, setSearchOperation] = useState<'sale' | 'rent'>('sale');
  const [searchQuery, setSearchQuery] = useState('');
  const [locationOpen, setLocationOpen] = useState(false);
  const [locationError, setLocationError] = useState(false);
  const [propertyCount, setPropertyCount] = useState(0);
  const [showMore, setShowMore] = useState(false);
  const [geoPermission, setGeoPermission] = useState<'unknown' | 'granted' | 'prompt' | 'denied' | 'unsupported'>('unknown');
  const [featuredProperties, setFeaturedProperties] = useState<FeaturedProperty[]>([]);
  const [featuredLoading, setFeaturedLoading] = useState(false);
  const userCoordsRef = useRef<{ lat: number; lng: number } | null>(null);

  // Track geolocation permission; featured section only shows when granted
  useEffect(() => {
    if (!('permissions' in navigator)) {
      setGeoPermission('unsupported');
      return;
    }
    let status: PermissionStatus | null = null;
    const handleChange = () => {
      if (status) setGeoPermission(status.state as 'granted' | 'prompt' | 'denied');
    };
    navigator.permissions
      .query({ name: 'geolocation' as PermissionName })
      .then((s) => {
        status = s;
        handleChange();
        s.addEventListener('change', handleChange);
      })
      .catch(() => setGeoPermission('unsupported'));
    return () => status?.removeEventListener('change', handleChange);
  }, []);

  // Ask for location permission on entry; if granted, the permission listener
  // above flips the state and the featured section loads. If denied, it never shows.
  useEffect(() => {
    if (geoPermission === 'prompt' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(() => {}, () => {}, { timeout: 15000 });
    }
  }, [geoPermission]);


  // Load featured properties only when location permission has been granted
  useEffect(() => {
    if (geoPermission !== 'granted') return;
    let cancelled = false;

    const load = async () => {
      setFeaturedLoading(true);
      try {
        // Best-effort position; featured still loads if the browser refuses
        await new Promise<void>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              userCoordsRef.current = { lat: pos.coords.latitude, lng: pos.coords.longitude };
              resolve();
            },
            () => resolve(),
            { timeout: 8000, maximumAge: 600000 }
          );
        });
        if (cancelled) return;

        const [propsRes, profilesRes] = await Promise.all([
          supabase
            .from('properties')
            .select('*')
            .or('is_rented.is.null,is_rented.eq.false')
            .order('created_at', { ascending: false })
            .limit(24),
          supabase.from('profiles').select('id, email'),
        ]);
        if (cancelled || propsRes.error || !propsRes.data) return;

        const emails = new Map<string, string>(
          (profilesRes.data || []).map((p: { id: string; email: string | null }) => [p.id, p.email || ''])
        );
        const coords = userCoordsRef.current;

        const mapped: FeaturedProperty[] = propsRes.data.map((prop: any) => ({
          id: parseInt(prop.id.slice(-8), 16),
          originalId: prop.id,
          reference: prop.reference,
          title: prop.title,
          type: prop.type,
          price: prop.price,
          currency: prop.currency,
          operation: prop.operation,
          location: prop.location,
          bedrooms: prop.bedrooms,
          bathrooms: prop.bathrooms,
          area: prop.area,
          image: prop.image ? prop.image.split(',')[0].trim() : "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3",
          features: prop.features || [],
          managedBy: (emails.get(prop.user_id)?.endsWith('@nazarihomes.com') ? 'nazari' : 'other') as 'nazari' | 'other',
          distanceKm:
            coords && prop.latitude != null && prop.longitude != null
              ? calculateDistance(coords.lat, coords.lng, prop.latitude, prop.longitude)
              : null,
        }));

        // Closest first (properties without coordinates keep their recency order at the end)
        mapped.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
        if (!cancelled) setFeaturedProperties(mapped.slice(0, 6));
      } catch (error) {
        console.error('Error loading featured properties:', error);
      } finally {
        if (!cancelled) setFeaturedLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [geoPermission]);


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

      {/* Featured Properties — only when geolocation permission is granted */}
      {geoPermission === 'granted' && (
        <section className="py-10 md:py-16 bg-secondary">
          <div className="container mx-auto px-6">
            <Reveal className="text-center mb-8 md:mb-12">
              <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-2">{t("properties.featured")}</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">{t("properties.featured_desc")}</p>
            </Reveal>

            {featuredLoading ? (
              <div className="flex justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : featuredProperties.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {featuredProperties.map((property, i) => (
                    <Reveal key={property.originalId ?? property.id} delay={i * 80}>
                      <PropertyCard property={property} />
                    </Reveal>
                  ))}
                </div>
                <div className="text-center">
                  <Link to="/properties">
                    <Button variant="outline" size="lg">
                      {t("properties.view_all")}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </>
            ) : null}
          </div>
        </section>
      )}

      {/* Tenant Section */}
      <section className="py-8 md:py-14 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6">
          <Reveal className="max-w-3xl mx-auto text-center mb-5 md:mb-8">
            <h2 className="text-xl md:text-3xl font-bold mb-2">{t("tenant_section.title")}</h2>
            <p className="text-sm md:text-lg text-primary-foreground/80 max-w-xl mx-auto">{t("tenant_section.subtitle")}</p>
          </Reveal>

          {/* Compact steps */}
          <div className="grid grid-cols-3 gap-2 md:gap-6 max-w-3xl mx-auto mb-4 md:mb-6">
            {[
              { icon: Shield, key: "step1", delay: 0 },
              { icon: Camera, key: "step2", delay: 120 },
              { icon: MessageCircle, key: "step3", delay: 240 },
            ].map(({ icon: Icon, key, delay }) => (
              <Reveal key={key} delay={delay} className="text-center h-full">
                <div className="bg-secondary/90 rounded-lg p-3 md:rounded-xl md:p-5 transition-colors hover:bg-accent/20 h-full flex flex-col items-center justify-center">
                  <Icon className="h-5 w-5 text-primary mx-auto mb-1.5 md:h-7 md:w-7 md:mb-2" />
                  <p className="text-xs md:text-sm font-semibold text-foreground leading-tight">
                    {t(`tenant_section.${key}_title`)}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Ver más / Ver menos */}
          <Reveal delay={120} className="text-center mb-5 md:mb-8">
            <button
              type="button"
              onClick={() => setShowMore((v) => !v)}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              {showMore ? t("tenant_section.less") : t("tenant_section.more")}
              <ChevronDown className={`h-4 w-4 transition-transform ${showMore ? "rotate-180" : ""}`} />
            </button>
          </Reveal>

          {/* Expanded details */}
          {showMore && (
            <div className="max-w-3xl mx-auto mb-6 md:mb-10 space-y-3 md:space-y-4">
              {["step1", "step2", "step3"].map((key, i) => (
                <Reveal key={key} delay={i * 80} className="flex items-start gap-3 bg-card/10 rounded-lg p-3 md:p-4">
                  <span className="w-6 h-6 shrink-0 rounded-full bg-card/20 flex items-center justify-center text-xs font-bold text-primary-foreground">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="text-sm md:text-base font-semibold">{t(`tenant_section.${key}_title`)}</h3>
                    <p className="text-primary-foreground/70 text-xs md:text-sm">{t(`tenant_section.${key}_desc`)}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          )}

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
