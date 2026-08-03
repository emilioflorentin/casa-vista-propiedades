import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Users, Heart, BarChart3, Layers, MessageCircle } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import {
  fetchDailyViews,
  fetchListingStats,
  type EntityType,
  type ListingStatsRow,
} from '@/utils/analyticsEvents';

export interface StatsItem {
  id: string;
  title: string;
  subtitle?: string;
  image?: string | null;
  extra?: { label: string; value: number; icon?: 'like' | 'match' }[];
}

interface Props {
  entityType: EntityType;
  items: StatsItem[];
  accentClass?: string;
  emptyMessage?: string;
}

const empty: ListingStatsRow = {
  entity_id: '',
  views: 0,
  unique_visitors: 0,
  impressions: 0,
  favorites: 0,
  views_7d: 0,
  views_30d: 0,
};

const Metric = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) => (
  <div className="rounded-lg border bg-card p-3">
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      {icon}
      {label}
    </div>
    <div className="text-xl font-bold mt-1">{value}</div>
  </div>
);

const ListingStatsPanel = ({ entityType, items, accentClass = 'text-primary', emptyMessage }: Props) => {
  const [stats, setStats] = useState<Record<string, ListingStatsRow>>({});
  const [loading, setLoading] = useState(true);
  const [openChart, setOpenChart] = useState<string | null>(null);
  const [series, setSeries] = useState<{ day: string; views: number }[]>([]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchListingStats(entityType).then((s) => {
      if (!active) return;
      setStats(s);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [entityType]);

  const totals = useMemo(() => {
    return items.reduce(
      (acc, it) => {
        const s = stats[it.id] || empty;
        acc.views += Number(s.views || 0);
        acc.unique += Number(s.unique_visitors || 0);
        acc.favorites += Number(s.favorites || 0);
        acc.impressions += Number(s.impressions || 0);
        return acc;
      },
      { views: 0, unique: 0, favorites: 0, impressions: 0 }
    );
  }, [items, stats]);

  const toggleChart = async (id: string) => {
    if (openChart === id) {
      setOpenChart(null);
      return;
    }
    setOpenChart(id);
    setSeries([]);
    const data = await fetchDailyViews(entityType, id, 30);
    setSeries(
      data.map((d) => ({
        day: new Date(d.day).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }),
        views: Number(d.views || 0),
      }))
    );
  };

  if (!loading && items.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          {emptyMessage || 'Todavía no tienes anuncios publicados.'}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Metric icon={<Eye className="w-3.5 h-3.5" />} label="Visitas totales" value={totals.views} />
        <Metric icon={<Users className="w-3.5 h-3.5" />} label="Visitantes únicos" value={totals.unique} />
        <Metric icon={<Heart className="w-3.5 h-3.5" />} label="Guardados" value={totals.favorites} />
        <Metric
          icon={<Layers className="w-3.5 h-3.5" />}
          label={entityType === 'roomie_listing' ? 'Veces mostrado' : 'Impresiones'}
          value={totals.impressions}
        />
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Cargando estadísticas…</p>
      ) : (
        <div className="space-y-4">
          {items.map((item) => {
            const s = stats[item.id] || empty;
            return (
              <Card key={item.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-14 h-14 rounded-lg object-cover bg-muted"
                        loading="lazy"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-base truncate">{item.title}</CardTitle>
                      {item.subtitle && (
                        <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>
                      )}
                    </div>
                    <Button variant="outline" size="sm" onClick={() => toggleChart(item.id)}>
                      <BarChart3 className={`w-4 h-4 mr-1 ${accentClass}`} />
                      {openChart === item.id ? 'Ocultar' : '30 días'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Metric icon={<Eye className="w-3.5 h-3.5" />} label="Visitas" value={Number(s.views)} />
                    <Metric icon={<Users className="w-3.5 h-3.5" />} label="Únicos" value={Number(s.unique_visitors)} />
                    <Metric icon={<Heart className="w-3.5 h-3.5" />} label="Guardados" value={Number(s.favorites)} />
                    <Metric icon={<Eye className="w-3.5 h-3.5" />} label="Últimos 7 días" value={Number(s.views_7d)} />
                  </div>

                  {item.extra && item.extra.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {item.extra.map((e) => (
                        <Badge key={e.label} variant="secondary" className="gap-1">
                          {e.icon === 'match' ? <MessageCircle className="w-3 h-3" /> : <Heart className="w-3 h-3" />}
                          {e.label}: {e.value}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {openChart === item.id && (
                    <div className="h-56 pt-2">
                      {series.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Cargando gráfica…</p>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={series} margin={{ left: -20, right: 8, top: 8 }}>
                            <defs>
                              <linearGradient id="viewsFill" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis dataKey="day" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                            <YAxis allowDecimals={false} tick={{ fontSize: 10 }} width={30} />
                            <Tooltip />
                            <Area
                              type="monotone"
                              dataKey="views"
                              name="Visitas"
                              stroke="hsl(var(--primary))"
                              fill="url(#viewsFill)"
                              strokeWidth={2}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ListingStatsPanel;
