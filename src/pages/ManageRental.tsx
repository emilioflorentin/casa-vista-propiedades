import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Canvas as FabricCanvas, Rect, Circle, FabricText } from 'fabric';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft,
  Plus,
  Square,
  Circle as CircleIcon,
  Type,
  Save,
  Users,
  Edit,
  Trash2
} from 'lucide-react';
import { getUserProperties, LocalProperty } from '@/utils/localProperties';
import { getUserHash } from '@/utils/userHash';

interface RoomAssignment {
  id: string;
  room_id: string;
  tenant_name?: string;
  tenant_phone?: string;
  tenant_email?: string;
  rent_amount?: number;
  start_date?: string;
  end_date?: string;
}

interface FloorPlanData {
  id?: string;
  property_id: string;
  user_id: string;
  floor_plan_data?: any;
}

const ManageRental = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [activeTool, setActiveTool] = useState<'select' | 'rectangle' | 'circle' | 'text'>('select');
  const [property, setProperty] = useState<LocalProperty | null>(null);
  const [floorPlan, setFloorPlan] = useState<FloorPlanData | null>(null);
  const [roomAssignments, setRoomAssignments] = useState<RoomAssignment[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [showRoomDialog, setShowRoomDialog] = useState(false);
  const [roomForm, setRoomForm] = useState({
    tenant_name: '',
    tenant_phone: '',
    tenant_email: '',
    rent_amount: '',
    start_date: '',
    end_date: ''
  });

  // Load property data
  useEffect(() => {
    const loadProperty = async () => {
      if (!propertyId || !user) return;

      // Try to find in local properties first
      const userHash = await getUserHash();
      if (userHash) {
        const localProperties = getUserProperties(userHash);
        const localProperty = localProperties.find(p => p.id === propertyId);
        if (localProperty) {
          setProperty(localProperty);
          return;
        }
      }

      // If not found locally, try database
      const { data: dbProperty } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .eq('user_id', user.id)
        .single();

      if (dbProperty) {
        // Convert DB property to LocalProperty format
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
    };

    loadProperty();
  }, [propertyId, user]);

  // Initialize fabric canvas
  useEffect(() => {
    if (!canvasRef.current || fabricCanvas) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: '#f8f9fa',
    });

    setFabricCanvas(canvas);
    try {
      toast({ title: 'Lienzo listo', description: 'Puedes empezar a crear el plano.' });
    } catch (_) {}

    return () => {
      canvas.dispose();
    };
  }, []);

  // Load floor plan data
  useEffect(() => {
    const loadFloorPlan = async () => {
      if (!propertyId || !user) return;

      const { data } = await supabase
        .from('property_floor_plans')
        .select('*')
        .eq('property_id', propertyId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        setFloorPlan(data);
        if (data.floor_plan_data && fabricCanvas) {
          fabricCanvas.loadFromJSON(data.floor_plan_data, () => {
            fabricCanvas.renderAll();
          });
        }
      }

      // Load room assignments
      if (data) {
        const { data: assignments } = await supabase
          .from('room_assignments')
          .select('*')
          .eq('floor_plan_id', data.id);

        if (assignments) {
          setRoomAssignments(assignments);
        }
      }
    };

    if (fabricCanvas) {
      loadFloorPlan();
    }
  }, [propertyId, user, fabricCanvas]);

  const handleToolClick = (tool: typeof activeTool) => {
    setActiveTool(tool);

    // Ensure canvas is initialized
    let c = fabricCanvas;
    if (!c && canvasRef.current) {
      c = new FabricCanvas(canvasRef.current, {
        width: 800,
        height: 600,
        backgroundColor: '#f8f9fa',
      });
      setFabricCanvas(c);
    }

    if (!c) {
      toast({ title: 'Lienzo no inicializado', description: 'Recarga la página e inténtalo de nuevo.', variant: 'destructive' });
      return;
    }

    c.isDrawingMode = false;

    if (tool === 'rectangle') {
      const rect = new Rect({
        left: 100,
        top: 100,
        fill: 'rgba(0, 123, 255, 0.3)',
        stroke: '#007bff',
        strokeWidth: 2,
        width: 100,
        height: 80,
        selectable: true
      });
      c.add(rect);
      c.renderAll();
      toast({ title: 'Rectángulo añadido', description: 'Puedes arrastrarlo y ajustar su tamaño.' });
    } else if (tool === 'circle') {
      const circle = new Circle({
        left: 100,
        top: 100,
        fill: 'rgba(40, 167, 69, 0.3)',
        stroke: '#28a745',
        strokeWidth: 2,
        radius: 50,
        selectable: true
      });
      c.add(circle);
      c.renderAll();
      toast({ title: 'Círculo añadido', description: 'Puedes arrastrarlo y ajustar su tamaño.' });
    } else if (tool === 'text') {
      const text = new FabricText('Habitación', {
        left: 100,
        top: 100,
        fontSize: 16,
        fill: '#333',
        selectable: true
      });
      c.add(text);
      c.renderAll();
      toast({ title: 'Texto añadido', description: 'Haz doble clic para editar el texto.' });
    }
  };

  const saveFloorPlan = async () => {
    if (!fabricCanvas || !propertyId || !user) return;

    const canvasData = JSON.stringify(fabricCanvas.toJSON());

    try {
      if (floorPlan?.id) {
        // Update existing floor plan
        const { error } = await supabase
          .from('property_floor_plans')
          .update({ floor_plan_data: canvasData })
          .eq('id', floorPlan.id);

        if (error) throw error;
      } else {
        // Create new floor plan
        const { data, error } = await supabase
          .from('property_floor_plans')
          .insert({
            property_id: propertyId,
            user_id: user.id,
            floor_plan_data: canvasData
          })
          .select()
          .single();

        if (error) throw error;
        setFloorPlan(data);
      }

      toast({
        title: "Éxito",
        description: "Plano guardado correctamente"
      });
    } catch (error) {
      console.error('Error saving floor plan:', error);
      toast({
        title: "Error",
        description: "Error al guardar el plano",
        variant: "destructive"
      });
    }
  };

  const handleObjectDoubleClick = (e: any) => {
    const target = e.target;
    if (target && (target.type === 'rect' || target.type === 'circle')) {
      setSelectedRoom(target);
      // Find existing assignment for this room
      const assignment = roomAssignments.find(a => a.room_id === target.id);
      if (assignment) {
        setRoomForm({
          tenant_name: assignment.tenant_name || '',
          tenant_phone: assignment.tenant_phone || '',
          tenant_email: assignment.tenant_email || '',
          rent_amount: assignment.rent_amount?.toString() || '',
          start_date: assignment.start_date || '',
          end_date: assignment.end_date || ''
        });
      } else {
        setRoomForm({
          tenant_name: '',
          tenant_phone: '',
          tenant_email: '',
          rent_amount: '',
          start_date: '',
          end_date: ''
        });
      }
      setShowRoomDialog(true);
    }
  };

  // Add double click listener to canvas
  useEffect(() => {
    if (fabricCanvas) {
      fabricCanvas.on('mouse:dblclick', handleObjectDoubleClick);
      return () => {
        fabricCanvas.off('mouse:dblclick', handleObjectDoubleClick);
      };
    }
  }, [fabricCanvas, roomAssignments]);

  const saveRoomAssignment = async () => {
    if (!selectedRoom || !floorPlan?.id) return;

    const roomData = {
      floor_plan_id: floorPlan.id,
      room_id: selectedRoom.id || `room_${Date.now()}`,
      tenant_name: roomForm.tenant_name || null,
      tenant_phone: roomForm.tenant_phone || null,
      tenant_email: roomForm.tenant_email || null,
      rent_amount: roomForm.rent_amount ? parseFloat(roomForm.rent_amount) : null,
      start_date: roomForm.start_date || null,
      end_date: roomForm.end_date || null
    };

    try {
      const existingAssignment = roomAssignments.find(a => a.room_id === roomData.room_id);

      if (existingAssignment) {
        const { error } = await supabase
          .from('room_assignments')
          .update(roomData)
          .eq('id', existingAssignment.id);

        if (error) throw error;

        setRoomAssignments(prev => 
          prev.map(a => a.id === existingAssignment.id ? { ...a, ...roomData } : a)
        );
      } else {
        const { data, error } = await supabase
          .from('room_assignments')
          .insert(roomData)
          .select()
          .single();

        if (error) throw error;

        setRoomAssignments(prev => [...prev, data]);
      }

      // Update room visual indicator
      if (roomForm.tenant_name) {
        selectedRoom.set('fill', 'rgba(220, 53, 69, 0.3)'); // Red for occupied
        selectedRoom.set('stroke', '#dc3545');
      } else {
        selectedRoom.set('fill', 'rgba(40, 167, 69, 0.3)'); // Green for available
        selectedRoom.set('stroke', '#28a745');
      }
      fabricCanvas?.renderAll();

      setShowRoomDialog(false);
      toast({
        title: "Éxito",
        description: "Asignación de habitación guardada"
      });
    } catch (error) {
      console.error('Error saving room assignment:', error);
      toast({
        title: "Error",
        description: "Error al guardar la asignación",
        variant: "destructive"
      });
    }
  };

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
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              onClick={() => navigate('/account')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-stone-800">Gestionar Alquiler</h1>
              {property && (
                <p className="text-stone-600">{property.title} - {property.location}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Floor Plan Editor */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Plano de la Vivienda
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={activeTool === 'select' ? 'default' : 'outline'}
                        onClick={() => setActiveTool('select')}
                      >
                        Seleccionar
                      </Button>
                      <Button
                        size="sm"
                        variant={activeTool === 'rectangle' ? 'default' : 'outline'}
                        onClick={() => handleToolClick('rectangle')}
                      >
                        <Square className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant={activeTool === 'circle' ? 'default' : 'outline'}
                        onClick={() => handleToolClick('circle')}
                      >
                        <CircleIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant={activeTool === 'text' ? 'default' : 'outline'}
                        onClick={() => handleToolClick('text')}
                      >
                        <Type className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={saveFloorPlan}
                        className="bg-stone-700 hover:bg-stone-600"
                      >
                        <Save className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border border-stone-200 rounded-lg overflow-hidden">
                    <canvas ref={canvasRef} className="max-w-full" />
                  </div>
                  <p className="text-sm text-stone-600 mt-2">
                    Haz doble clic en las habitaciones para asignar inquilinos
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Room Assignments List */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Asignaciones de Habitaciones
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {roomAssignments.length === 0 ? (
                    <p className="text-stone-600 text-center py-4">
                      No hay habitaciones asignadas aún
                    </p>
                  ) : (
                    roomAssignments.map((assignment) => (
                      <div key={assignment.id} className="border border-stone-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant={assignment.tenant_name ? "destructive" : "secondary"}>
                            {assignment.tenant_name ? "Ocupada" : "Disponible"}
                          </Badge>
                        </div>
                        {assignment.tenant_name && (
                          <div className="space-y-1 text-sm">
                            <p><strong>Inquilino:</strong> {assignment.tenant_name}</p>
                            {assignment.tenant_phone && (
                              <p><strong>Teléfono:</strong> {assignment.tenant_phone}</p>
                            )}
                            {assignment.rent_amount && (
                              <p><strong>Renta:</strong> €{assignment.rent_amount}/mes</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Room Assignment Dialog */}
      <Dialog open={showRoomDialog} onOpenChange={setShowRoomDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Asignar Habitación</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tenant_name">Nombre del Inquilino</Label>
              <Input
                id="tenant_name"
                value={roomForm.tenant_name}
                onChange={(e) => setRoomForm(prev => ({ ...prev, tenant_name: e.target.value }))}
                placeholder="Nombre completo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tenant_phone">Teléfono</Label>
              <Input
                id="tenant_phone"
                value={roomForm.tenant_phone}
                onChange={(e) => setRoomForm(prev => ({ ...prev, tenant_phone: e.target.value }))}
                placeholder="Número de teléfono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tenant_email">Email</Label>
              <Input
                id="tenant_email"
                type="email"
                value={roomForm.tenant_email}
                onChange={(e) => setRoomForm(prev => ({ ...prev, tenant_email: e.target.value }))}
                placeholder="correo@ejemplo.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rent_amount">Renta Mensual (€)</Label>
              <Input
                id="rent_amount"
                type="number"
                value={roomForm.rent_amount}
                onChange={(e) => setRoomForm(prev => ({ ...prev, rent_amount: e.target.value }))}
                placeholder="0"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Fecha Inicio</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={roomForm.start_date}
                  onChange={(e) => setRoomForm(prev => ({ ...prev, start_date: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">Fecha Fin</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={roomForm.end_date}
                  onChange={(e) => setRoomForm(prev => ({ ...prev, end_date: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={saveRoomAssignment} className="flex-1">
                Guardar Asignación
              </Button>
              <Button variant="outline" onClick={() => setShowRoomDialog(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default ManageRental;