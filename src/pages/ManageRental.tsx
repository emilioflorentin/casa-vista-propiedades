import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { RoomCard } from '../components/RoomCard';
import { RoomFormDialog } from '../components/RoomFormDialog';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Plus, Home, Users } from 'lucide-react';
import { getUserProperties, LocalProperty } from '@/utils/localProperties';
import { getUserHash } from '@/utils/userHash';

interface Room {
  id: string;
  property_id: string;
  room_name: string;
  room_type: string;
  room_size?: number;
  tenant_name?: string;
  tenant_phone?: string;
  tenant_email?: string;
  rent_amount?: number;
  start_date?: string;
  end_date?: string;
}

const isUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

const ManageRental = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [property, setProperty] = useState<LocalProperty | null>(null);
  const [resolvedPropertyId, setResolvedPropertyId] = useState<string | null>(null);

  const [rooms, setRooms] = useState<Room[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [deleteRoomId, setDeleteRoomId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    room_name: '',
    room_type: '',
    room_size: '',
    tenant_name: '',
    tenant_phone: '',
    tenant_email: '',
    rent_amount: '',
    start_date: '',
    end_date: ''
  });

  useEffect(() => {
    const init = async () => {
      if (!propertyId || !user) return;
      const resolvedId = await resolveAndLoadProperty(propertyId);
      if (resolvedId) {
        await loadRooms(resolvedId);
      } else {
        setRooms([]);
      }
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId, user?.id]);

  const resolveAndLoadProperty = async (rawPropertyId: string): Promise<string | null> => {
    if (!user) return null;

    // Case 1: Already a DB UUID
    if (isUuid(rawPropertyId)) {
      setResolvedPropertyId(rawPropertyId);

      // Try local cache only for display (optional)
      const userHash = await getUserHash();
      if (userHash) {
        const localProperties = getUserProperties(userHash);
        const localProperty = localProperties.find(p => p.id === rawPropertyId);
        if (localProperty) {
          setProperty(localProperty);
          return rawPropertyId;
        }
      }

      // Fallback to DB
      const { data: dbProperty } = await supabase
        .from('properties')
        .select('*')
        .eq('id', rawPropertyId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (dbProperty) {
        const convertedProperty: LocalProperty = {
          id: dbProperty.id,
          userHash: '',
          userId: dbProperty.user_id,
          reference: dbProperty.reference,
          title: dbProperty.title,
          type: dbProperty.type,
          price: dbProperty.price,
          currency: dbProperty.currency,
          operation: dbProperty.operation,
          location: dbProperty.location,
          bedrooms: dbProperty.bedrooms,
          bathrooms: dbProperty.bathrooms,
          area: dbProperty.area,
          images: dbProperty.image ? [dbProperty.image] : [],
          features: dbProperty.features || [],
          description: dbProperty.description,
          is_rented: dbProperty.is_rented,
          created_at: dbProperty.created_at
        };
        setProperty(convertedProperty);
      }

      return rawPropertyId;
    }

    // Case 2: Local property ID (Date.now string). We must sync it to DB to get a UUID.
    const userHash = await getUserHash();
    if (!userHash) return null;

    const localProperties = getUserProperties(userHash);
    const localProperty = localProperties.find(p => p.id === rawPropertyId);

    if (!localProperty) {
      toast({
        title: 'Error',
        description: 'No se encontró la propiedad para gestionar el alquiler.',
        variant: 'destructive'
      });
      return null;
    }

    setProperty(localProperty);

    // 1) Try find existing DB property by (reference + user_id)
    const { data: existing, error: findError } = await supabase
      .from('properties')
      .select('id')
      .eq('reference', localProperty.reference)
      .eq('user_id', user.id)
      .maybeSingle();

    if (findError) {
      console.error('Error finding property in DB:', findError);
    }

    if (existing?.id) {
      setResolvedPropertyId(existing.id);
      navigate(`/manage-rental/${existing.id}`, { replace: true });
      return existing.id;
    }

    // 2) Create the DB property (minimal required fields)
    toast({
      title: 'Sincronizando…',
      description: 'Preparando la propiedad para gestionar habitaciones.'
    });

    const insertPayload = {
      user_id: user.id,
      reference: localProperty.reference,
      title: localProperty.title,
      type: localProperty.type,
      price: localProperty.price,
      currency: localProperty.currency || 'EUR',
      operation: localProperty.operation,
      location: localProperty.location,
      bedrooms: localProperty.bedrooms,
      bathrooms: localProperty.bathrooms,
      area: localProperty.area,
      description: localProperty.description ?? null,
      features: localProperty.features ?? null,
      image: null,
      is_rented: localProperty.is_rented ?? false
    };

    const { data: created, error: createError } = await supabase
      .from('properties')
      .insert(insertPayload)
      .select('id')
      .single();

    if (createError) {
      console.error('Error creating property in DB:', createError);
      toast({
        title: 'Error',
        description: 'No se pudo sincronizar la propiedad. Intenta de nuevo.',
        variant: 'destructive'
      });
      return null;
    }

    setResolvedPropertyId(created.id);
    navigate(`/manage-rental/${created.id}`, { replace: true });

    toast({
      title: 'Listo',
      description: 'Propiedad sincronizada. Ya puedes crear habitaciones.'
    });

    return created.id;
  };

  const loadRooms = async (propertyUuid: string) => {
    if (!user || !propertyUuid) return;

    const { data, error } = await supabase
      .from('room_assignments')
      .select('*')
      .eq('property_id', propertyUuid)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading rooms:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las habitaciones',
        variant: 'destructive'
      });
      return;
    }

    setRooms(data || []);
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      room_name: '',
      room_type: '',
      room_size: '',
      tenant_name: '',
      tenant_phone: '',
      tenant_email: '',
      rent_amount: '',
      start_date: '',
      end_date: ''
    });
    setEditingRoom(null);
  };

  const handleAddRoom = () => {
    resetForm();
    setShowDialog(true);
  };

  const handleEditRoom = (room: Room) => {
    setEditingRoom(room);
    setFormData({
      room_name: room.room_name,
      room_type: room.room_type,
      room_size: room.room_size?.toString() || '',
      tenant_name: room.tenant_name || '',
      tenant_phone: room.tenant_phone || '',
      tenant_email: room.tenant_email || '',
      rent_amount: room.rent_amount?.toString() || '',
      start_date: room.start_date || '',
      end_date: room.end_date || ''
    });
    setShowDialog(true);
  };

  const handleSaveRoom = async () => {
    if (!formData.room_name.trim() || !formData.room_type) {
      toast({
        title: 'Error',
        description: 'El nombre y tipo de habitación son obligatorios',
        variant: 'destructive'
      });
      return;
    }

    const roomData = {
      property_id: propertyId!,
      room_name: formData.room_name.trim(),
      room_type: formData.room_type,
      room_size: formData.room_size ? parseFloat(formData.room_size) : null,
      tenant_name: formData.tenant_name.trim() || null,
      tenant_phone: formData.tenant_phone.trim() || null,
      tenant_email: formData.tenant_email.trim() || null,
      rent_amount: formData.rent_amount ? parseFloat(formData.rent_amount) : null,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null
    };

    try {
      if (editingRoom) {
        const { error } = await supabase
          .from('room_assignments')
          .update(roomData)
          .eq('id', editingRoom.id);

        if (error) throw error;

        toast({
          title: 'Éxito',
          description: 'Habitación actualizada correctamente'
        });
      } else {
        const { error } = await supabase
          .from('room_assignments')
          .insert(roomData);

        if (error) throw error;

        toast({
          title: 'Éxito',
          description: 'Habitación creada correctamente'
        });
      }

      setShowDialog(false);
      resetForm();
      if (resolvedPropertyId) loadRooms(resolvedPropertyId);
    } catch (error) {
      console.error('Error saving room:', error);
      toast({
        title: 'Error',
        description: 'Error al guardar la habitación',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteRoom = async () => {
    if (!deleteRoomId) return;

    try {
      const { error } = await supabase
        .from('room_assignments')
        .delete()
        .eq('id', deleteRoomId);

      if (error) throw error;

      toast({
        title: 'Éxito',
        description: 'Habitación eliminada correctamente'
      });

      setDeleteRoomId(null);
      if (resolvedPropertyId) loadRooms(resolvedPropertyId);
    } catch (error) {
      console.error('Error deleting room:', error);
      toast({
        title: 'Error',
        description: 'Error al eliminar la habitación',
        variant: 'destructive'
      });
    }
  };

  const occupiedRooms = rooms.filter(r => r.tenant_name);
  const availableRooms = rooms.filter(r => !r.tenant_name);
  const totalRent = rooms.reduce((sum, r) => sum + (r.rent_amount || 0), 0);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <p>Acceso no autorizado</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              onClick={() => navigate('/account')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-stone-800">Gestionar Alquiler</h1>
              {property && (
                <p className="text-stone-600">{property.title} - {property.location}</p>
              )}
            </div>
            <Button onClick={handleAddRoom} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Nueva Habitación
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Habitaciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Home className="w-5 h-5 text-primary" />
                  <span className="text-2xl font-bold">{rooms.length}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Ocupadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-destructive" />
                  <span className="text-2xl font-bold">{occupiedRooms.length}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Disponibles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Home className="w-5 h-5 text-secondary" />
                  <span className="text-2xl font-bold">{availableRooms.length}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Renta Total
                </CardTitle>
              </CardHeader>
              <CardContent>
                <span className="text-2xl font-bold text-primary">€{totalRent}</span>
                <span className="text-sm text-muted-foreground">/mes</span>
              </CardContent>
            </Card>
          </div>

          {/* Rooms Grid */}
          {rooms.length === 0 ? (
            <Card className="p-12">
              <div className="text-center">
                <Home className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No hay habitaciones</h3>
                <p className="text-muted-foreground mb-6">
                  Comienza agregando las habitaciones de tu propiedad
                </p>
                <Button onClick={handleAddRoom}>
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Primera Habitación
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  onEdit={() => handleEditRoom(room)}
                  onDelete={() => setDeleteRoomId(room.id)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <RoomFormDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        formData={formData}
        onFormChange={handleFormChange}
        onSave={handleSaveRoom}
        isEditing={!!editingRoom}
      />

      <AlertDialog open={!!deleteRoomId} onOpenChange={() => setDeleteRoomId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar habitación?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la habitación y toda su información.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRoom}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </div>
  );
};

export default ManageRental;
