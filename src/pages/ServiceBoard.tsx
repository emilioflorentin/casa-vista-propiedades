import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Wrench,
  MapPin,
  User,
  Phone,
  ChevronRight,
  RefreshCw,
  Image as ImageIcon
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Incident {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  images: string[] | null;
  created_at: string;
  updated_at: string;
  property_id: string;
  tenant_access_id: string;
}

interface PropertyInfo {
  id: string;
  title: string;
  location: string;
  user_id: string;
}

interface TenantInfo {
  id: string;
  tenant_name: string;
  tenant_phone: string | null;
}

interface OwnerInfo {
  full_name: string;
  phone: string;
  email: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  plumbing: '🔧 Fontanería',
  electrical: '⚡ Electricidad',
  appliances: '🏠 Electrodomésticos',
  structural: '🧱 Estructura',
  painting: '🎨 Pintura',
  locksmith: '🔑 Cerrajería',
  cleaning: '🧹 Limpieza',
  pests: '🐛 Plagas',
  other: '📋 Otros',
};

const ServiceBoard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [properties, setProperties] = useState<Record<string, PropertyInfo>>({});
  const [tenants, setTenants] = useState<Record<string, TenantInfo>>({});
  const [owners, setOwners] = useState<Record<string, OwnerInfo>>({});
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }
    if (!authLoading && user?.email !== 'multiservicios@nazarihomes.com') {
      navigate('/account');
      return;
    }
    if (user) {
      loadData();
    }
  }, [user, authLoading]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch incidents (RLS filters to in_progress and resolved for this user)
      const { data: incidentsData, error: incidentsError } = await supabase
        .from('incidents')
        .select('*')
        .order('updated_at', { ascending: false });

      if (incidentsError) {
        console.error('Error loading incidents:', incidentsError);
        return;
      }

      setIncidents(incidentsData || []);

      // Fetch related property info
      const propertyIds = [...new Set((incidentsData || []).map(i => i.property_id))];
      const tenantAccessIds = [...new Set((incidentsData || []).map(i => i.tenant_access_id))];

      if (propertyIds.length > 0) {
        const { data: propsData } = await supabase
          .from('properties')
          .select('id, title, location, user_id')
          .in('id', propertyIds);

        if (propsData) {
          const propsMap: Record<string, PropertyInfo> = {};
          const ownerIds = [...new Set(propsData.map(p => p.user_id))];
          
          propsData.forEach(p => { propsMap[p.id] = p; });
          setProperties(propsMap);

          // Fetch owner profiles
          for (const ownerId of ownerIds) {
            const { data: ownerData } = await supabase
              .rpc('get_complete_profile_info', { profile_user_id: ownerId });
            if (ownerData) {
              setOwners(prev => ({ ...prev, [ownerId]: ownerData as unknown as OwnerInfo }));
            }
          }
        }
      }

      if (tenantAccessIds.length > 0) {
        const { data: tenantsData } = await supabase
          .from('tenant_access')
          .select('id, tenant_name, tenant_phone')
          .in('id', tenantAccessIds);

        if (tenantsData) {
          const tenantsMap: Record<string, TenantInfo> = {};
          tenantsData.forEach(t => { tenantsMap[t.id] = t; });
          setTenants(tenantsMap);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (incidentId: string, newStatus: string) => {
    const { error } = await supabase
      .from('incidents')
      .update({ status: newStatus })
      .eq('id', incidentId);

    if (error) {
      toast({ title: 'Error', description: 'No se pudo actualizar el estado', variant: 'destructive' });
    } else {
      toast({ title: 'Actualizado', description: `Estado cambiado a ${getStatusLabel(newStatus)}` });
      loadData();
      setSelectedIncident(null);
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'in_progress': return 'En progreso';
      case 'resolved': return 'Resuelto';
      default: return status;
    }
  };

  const inProgressIncidents = incidents.filter(i => i.status === 'in_progress');
  const resolvedIncidents = incidents.filter(i => i.status === 'resolved');

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const IncidentCard = ({ incident }: { incident: Incident }) => {
    const property = properties[incident.property_id];
    const tenant = tenants[incident.tenant_access_id];
    const owner = property ? owners[property.user_id] : null;

    return (
      <Card 
        className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-stone-400"
        onClick={() => setSelectedIncident(incident)}
      >
        <CardContent className="p-4 space-y-2">
          <div className="flex items-start justify-between">
            <h4 className="font-semibold text-sm text-stone-800 line-clamp-1">{incident.title}</h4>
            <Badge variant="outline" className="text-xs shrink-0 ml-2">
              {CATEGORY_LABELS[incident.category] || incident.category}
            </Badge>
          </div>
          <p className="text-xs text-stone-500 line-clamp-2">{incident.description}</p>
          {property && (
            <div className="flex items-center text-xs text-stone-500">
              <MapPin className="h-3 w-3 mr-1" />
              <span className="line-clamp-1">{property.title} - {property.location}</span>
            </div>
          )}
          {tenant && (
            <div className="flex items-center text-xs text-stone-500">
              <User className="h-3 w-3 mr-1" />
              <span>{tenant.tenant_name}</span>
            </div>
          )}
          {owner && (
            <div className="flex items-center text-xs text-stone-400">
              <span>Propietario: {owner.full_name}</span>
            </div>
          )}
          {incident.images && incident.images.length > 0 && (
            <div className="flex items-center text-xs text-stone-400">
              <ImageIcon className="h-3 w-3 mr-1" />
              <span>{incident.images.length} foto(s)</span>
            </div>
          )}
          <div className="text-xs text-stone-400">
            {formatDate(incident.created_at)}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-stone-400" />
          <p className="mt-4 text-stone-500">Cargando panel de servicios...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-stone-800 flex items-center gap-2">
              <Wrench className="h-8 w-8" />
              Panel de Multiservicios
            </h1>
            <p className="text-stone-500 mt-1">Gestión de incidencias asignadas</p>
          </div>
          <Button variant="outline" onClick={loadData} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </Button>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[60vh]">
          {/* In Progress Column */}
          <div className="bg-amber-50/50 rounded-xl p-4 border border-amber-200/50">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-amber-600" />
              <h2 className="font-bold text-stone-700">En Progreso</h2>
              <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                {inProgressIncidents.length}
              </Badge>
            </div>
            <div className="space-y-3">
              {inProgressIncidents.length === 0 ? (
                <p className="text-stone-400 text-sm text-center py-8">
                  No hay incidencias en progreso
                </p>
              ) : (
                inProgressIncidents.map(incident => (
                  <IncidentCard key={incident.id} incident={incident} />
                ))
              )}
            </div>
          </div>

          {/* Resolved Column */}
          <div className="bg-green-50/50 rounded-xl p-4 border border-green-200/50">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <h2 className="font-bold text-stone-700">Resueltos</h2>
              <Badge className="bg-green-100 text-green-700 border-green-200">
                {resolvedIncidents.length}
              </Badge>
            </div>
            <div className="space-y-3">
              {resolvedIncidents.length === 0 ? (
                <p className="text-stone-400 text-sm text-center py-8">
                  No hay incidencias resueltas
                </p>
              ) : (
                resolvedIncidents.map(incident => (
                  <IncidentCard key={incident.id} incident={incident} />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedIncident(null)}>
          <Card className="max-w-lg w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{selectedIncident.title}</CardTitle>
                <Badge variant="outline">
                  {CATEGORY_LABELS[selectedIncident.category] || selectedIncident.category}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-stone-600">{selectedIncident.description}</p>

              {/* Images */}
              {selectedIncident.images && selectedIncident.images.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {selectedIncident.images.map((img, i) => (
                    <img key={i} src={img} alt={`Foto ${i + 1}`} className="rounded-lg w-full h-32 object-cover" />
                  ))}
                </div>
              )}

              {/* Property & Contact Info */}
              {properties[selectedIncident.property_id] && (
                <div className="bg-stone-50 rounded-lg p-3 space-y-2">
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-2 text-stone-400" />
                    <span className="font-medium">{properties[selectedIncident.property_id].title}</span>
                  </div>
                  <p className="text-xs text-stone-500 ml-6">{properties[selectedIncident.property_id].location}</p>
                </div>
              )}

              {tenants[selectedIncident.tenant_access_id] && (
                <div className="bg-stone-50 rounded-lg p-3 space-y-1">
                  <p className="text-sm font-medium flex items-center">
                    <User className="h-4 w-4 mr-2 text-stone-400" />
                    {tenants[selectedIncident.tenant_access_id].tenant_name}
                  </p>
                  {tenants[selectedIncident.tenant_access_id].tenant_phone && (
                    <a 
                      href={`https://wa.me/${tenants[selectedIncident.tenant_access_id].tenant_phone?.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-green-600 flex items-center ml-6 hover:underline"
                    >
                      <Phone className="h-3 w-3 mr-1" />
                      {tenants[selectedIncident.tenant_access_id].tenant_phone}
                    </a>
                  )}
                </div>
              )}

              {properties[selectedIncident.property_id] && owners[properties[selectedIncident.property_id].user_id] && (
                <div className="bg-stone-50 rounded-lg p-3 space-y-1">
                  <p className="text-sm font-medium">Propietario: {owners[properties[selectedIncident.property_id].user_id].full_name}</p>
                  {owners[properties[selectedIncident.property_id].user_id].phone && (
                    <a 
                      href={`https://wa.me/${owners[properties[selectedIncident.property_id].user_id].phone?.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-green-600 flex items-center hover:underline"
                    >
                      <Phone className="h-3 w-3 mr-1" />
                      {owners[properties[selectedIncident.property_id].user_id].phone}
                    </a>
                  )}
                </div>
              )}

              <p className="text-xs text-stone-400">
                Creado: {formatDate(selectedIncident.created_at)} · Actualizado: {formatDate(selectedIncident.updated_at)}
              </p>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                {selectedIncident.status === 'in_progress' && (
                  <Button 
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => updateStatus(selectedIncident.id, 'resolved')}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Marcar como resuelto
                  </Button>
                )}
                {selectedIncident.status === 'resolved' && (
                  <Button 
                    variant="outline"
                    className="flex-1"
                    onClick={() => updateStatus(selectedIncident.id, 'in_progress')}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Reabrir
                  </Button>
                )}
                <Button variant="ghost" onClick={() => setSelectedIncident(null)}>
                  Cerrar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ServiceBoard;
