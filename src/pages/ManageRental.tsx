import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Canvas as FabricCanvas, Rect, Circle, Textbox, Line, Path } from 'fabric';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FloorPlanToolbar, { ToolType } from '../components/FloorPlanToolbar';
import FloorPlanProperties from '../components/FloorPlanProperties';
import FloorPlanTemplates from '../components/FloorPlanTemplates';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft,
  Users
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
  const [activeTool, setActiveTool] = useState<ToolType>('select');
  const [property, setProperty] = useState<LocalProperty | null>(null);
  const [floorPlan, setFloorPlan] = useState<FloorPlanData | null>(null);
  const [roomAssignments, setRoomAssignments] = useState<RoomAssignment[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [selectedObject, setSelectedObject] = useState<any>(null);
  const [showRoomDialog, setShowRoomDialog] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [history, setHistory] = useState<string[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const [isCanvasReady, setIsCanvasReady] = useState(false);
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

    console.info('EDITOR: initializing Fabric canvas');

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 1000,
      height: 700,
      backgroundColor: 'transparent',
      selection: true,
    });

    // Setup event handlers
    canvas.on('selection:created', (e) => setSelectedObject(e.selected?.[0]));
    canvas.on('selection:updated', (e) => setSelectedObject(e.selected?.[0]));
    canvas.on('selection:cleared', () => setSelectedObject(null));

    // Debounced history
    let historyTimeout: NodeJS.Timeout;
    const saveHistory = () => {
      clearTimeout(historyTimeout);
      historyTimeout = setTimeout(() => {
        const state = JSON.stringify(canvas.toJSON());
        setHistory(prev => [...prev.slice(0, historyStep + 1), state].slice(-50));
        setHistoryStep(prev => Math.min(prev + 1, 49));
      }, 300);
    };

    canvas.on('object:modified', saveHistory);

    // Initialize brush
    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.width = 2;
      canvas.freeDrawingBrush.color = '#000000';
    }

    // Wait for canvas to be fully ready
    requestAnimationFrame(() => {
      canvas.renderAll();
      setFabricCanvas(canvas);
      setIsCanvasReady(true);
      console.info('EDITOR: canvas ready');
    });

    return () => {
      clearTimeout(historyTimeout);
      canvas.dispose();
    };
  }, []);

  // Load floor plan data
  useEffect(() => {
    const loadFloorPlan = async () => {
      if (!propertyId || !user || !fabricCanvas || !isCanvasReady) return;

      const { data } = await supabase
        .from('property_floor_plans')
        .select('*')
        .eq('property_id', propertyId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        setFloorPlan(data);
        if (data.floor_plan_data) {
          fabricCanvas.loadFromJSON(data.floor_plan_data, () => {
            fabricCanvas.renderAll();
            // Reset history after loading
            setHistory([JSON.stringify(fabricCanvas.toJSON())]);
            setHistoryStep(0);
          });
        }

        // Load room assignments
        const { data: assignments } = await supabase
          .from('room_assignments')
          .select('*')
          .eq('floor_plan_id', data.id);

        if (assignments) {
          setRoomAssignments(assignments);
        }
      }
    };

    loadFloorPlan();
  }, [propertyId, user, fabricCanvas, isCanvasReady]);

  // History management
  const saveToHistory = () => {
    if (!fabricCanvas) return;
    
    const state = JSON.stringify(fabricCanvas.toJSON());
    setHistory(prev => {
      const newHistory = prev.slice(0, historyStep + 1);
      newHistory.push(state);
      return newHistory.slice(-50); // Keep last 50 states
    });
    setHistoryStep(prev => Math.min(prev + 1, 49));
  };

  const handleToolClick = (tool: ToolType) => {
    if (!fabricCanvas || !isCanvasReady) {
      toast({ title: 'Espera...', description: 'El editor se está inicializando.', variant: 'destructive' });
      return;
    }

    setActiveTool(tool);
    fabricCanvas.isDrawingMode = tool === 'eraser';
    fabricCanvas.selection = tool === 'select';

    if (tool === 'rectangle') {
      const rect = new Rect({
        left: 150,
        top: 150,
        fill: 'rgba(59, 130, 246, 0.3)',
        stroke: '#1e40af',
        strokeWidth: 2,
        width: 120,
        height: 100,
        selectable: true,
        id: `room_${Date.now()}`
      });
      fabricCanvas.add(rect);
      fabricCanvas.renderAll();
      fabricCanvas.setActiveObject(rect);
      setSelectedObject(rect);
      console.info('Rectangle added to canvas');
    } else if (tool === 'circle') {
      const circle = new Circle({
        left: 150,
        top: 150,
        fill: 'rgba(16, 185, 129, 0.3)',
        stroke: '#065f46',
        strokeWidth: 2,
        radius: 60,
        selectable: true,
        id: `area_${Date.now()}`
      });
      fabricCanvas.add(circle);
      fabricCanvas.renderAll();
      fabricCanvas.setActiveObject(circle);
      setSelectedObject(circle);
    } else if (tool === 'text') {
      const text = new Textbox('Habitación', {
        left: 150,
        top: 150,
        fontSize: 16,
        fill: '#374151',
        selectable: true,
        id: `text_${Date.now()}`
      });
      fabricCanvas.add(text);
      fabricCanvas.renderAll();
      fabricCanvas.setActiveObject(text);
      setSelectedObject(text);
    } else if (tool === 'line') {
      const line = new Line([100, 100, 200, 100], {
        stroke: '#6b7280',
        strokeWidth: 3,
        selectable: true,
        id: `line_${Date.now()}`
      });
      fabricCanvas.add(line);
      fabricCanvas.renderAll();
      fabricCanvas.setActiveObject(line);
      setSelectedObject(line);
    } else if (tool === 'arrow') {
      const arrowPath = 'M 0 0 L 80 0 M 70 -5 L 80 0 L 70 5';
      const arrow = new Path(arrowPath, {
        left: 150,
        top: 150,
        stroke: '#ef4444',
        strokeWidth: 2,
        fill: '',
        selectable: true,
        id: `arrow_${Date.now()}`
      });
      fabricCanvas.add(arrow);
      fabricCanvas.renderAll();
      fabricCanvas.setActiveObject(arrow);
      setSelectedObject(arrow);
    }
  };

  // Canvas controls
  const handleUndo = () => {
    if (historyStep > 0) {
      setHistoryStep(prev => prev - 1);
      fabricCanvas?.loadFromJSON(history[historyStep - 1], () => {
        fabricCanvas.renderAll();
      });
    }
  };

  const handleRedo = () => {
    if (historyStep < history.length - 1) {
      setHistoryStep(prev => prev + 1);
      fabricCanvas?.loadFromJSON(history[historyStep + 1], () => {
        fabricCanvas.renderAll();
      });
    }
  };

  const handleZoomIn = () => {
    if (!fabricCanvas) return;
    const newZoom = Math.min(zoom * 1.1, 3);
    setZoom(newZoom);
    fabricCanvas.setZoom(newZoom);
    fabricCanvas.renderAll();
  };

  const handleZoomOut = () => {
    if (!fabricCanvas) return;
    const newZoom = Math.max(zoom / 1.1, 0.2);
    setZoom(newZoom);
    fabricCanvas.setZoom(newZoom);
    fabricCanvas.renderAll();
  };

  const handleToggleGrid = () => {
    setShowGrid(prev => !prev);
  };

  const handleExportImage = () => {
    if (!fabricCanvas) return;
    
    // Set white background for export
    const originalBg = fabricCanvas.backgroundColor;
    fabricCanvas.backgroundColor = '#ffffff';
    fabricCanvas.renderAll();
    
    const dataURL = fabricCanvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 2
    });
    
    // Restore transparent background
    fabricCanvas.backgroundColor = originalBg;
    fabricCanvas.renderAll();
    
    // Download image
    const link = document.createElement('a');
    link.download = `plano_${property?.title || 'vivienda'}.png`;
    link.href = dataURL;
    link.click();
    
    toast({ title: 'Plano exportado', description: 'La imagen se ha descargado correctamente.' });
  };

  const handleUpdateObject = (properties: any) => {
    if (!selectedObject || !fabricCanvas) return;
    
    selectedObject.set(properties);
    fabricCanvas.renderAll();
    saveToHistory();
  };

  const handleDeleteObject = () => {
    if (!selectedObject || !fabricCanvas) return;
    
    fabricCanvas.remove(selectedObject);
    setSelectedObject(null);
    fabricCanvas.renderAll();
  };

  const handleLoadTemplate = (template: any) => {
    if (!fabricCanvas || !isCanvasReady) {
      toast({ title: 'Espera...', description: 'El editor se está inicializando.', variant: 'destructive' });
      return;
    }
    
    // Remove all objects instead of clear
    fabricCanvas.getObjects().forEach((obj) => fabricCanvas.remove(obj));
    
    // Convert old text objects to textbox for Fabric v6
    const updatedData = {
      ...template.data,
      objects: template.data.objects.map((obj: any) => {
        if (obj.type === 'text') {
          return { ...obj, type: 'textbox' };
        }
        return obj;
      })
    };
    
    fabricCanvas.loadFromJSON(updatedData, () => {
      fabricCanvas.renderAll();
      
      // Save to history
      const state = JSON.stringify(fabricCanvas.toJSON());
      setHistory([state]);
      setHistoryStep(0);
      
      toast({ title: 'Plantilla cargada', description: `Se ha cargado ${template.name}` });
    });
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

          {/* Professional Floor Plan Designer */}
          <div className="space-y-6">
            {/* Loading indicator */}
            {!isCanvasReady && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    <p className="text-blue-900 font-medium">Inicializando editor de planos...</p>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Toolbar */}
            <FloorPlanToolbar
              activeTool={activeTool}
              onToolClick={handleToolClick}
              onSave={saveFloorPlan}
              onUndo={handleUndo}
              onRedo={handleRedo}
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              onToggleGrid={handleToggleGrid}
              onExport={handleExportImage}
              showGrid={showGrid}
              canUndo={historyStep > 0}
              canRedo={historyStep < history.length - 1}
              zoom={zoom}
            />

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              {/* Main Canvas Area */}
              <div className="xl:col-span-3">
                <Card>
                  <CardContent className="p-0">
                    <div 
                      className="bg-stone-50 border-2 border-dashed border-stone-200 rounded-lg overflow-hidden relative"
                      style={{
                        backgroundImage: showGrid 
                          ? 'linear-gradient(to right, #e5e7eb 1px, transparent 1px), linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)'
                          : 'none',
                        backgroundSize: showGrid ? '20px 20px' : 'auto'
                      }}
                    >
                      <canvas 
                        ref={canvasRef} 
                        className="block border-0 bg-transparent shadow-inner"
                        style={{ maxWidth: '100%', height: 'auto' }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar with Tabs */}
              <div className="xl:col-span-1 space-y-6">
                <Tabs defaultValue="properties" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="properties">Propiedades</TabsTrigger>
                    <TabsTrigger value="rooms">Habitaciones</TabsTrigger>
                    <TabsTrigger value="templates">Plantillas</TabsTrigger>
                  </TabsList>

                  <TabsContent value="properties" className="mt-4">
                    <FloorPlanProperties
                      selectedObject={selectedObject}
                      onUpdateObject={handleUpdateObject}
                      onDeleteObject={handleDeleteObject}
                    />
                  </TabsContent>

                  <TabsContent value="rooms" className="mt-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="w-5 h-5" />
                          Asignaciones
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {roomAssignments.length === 0 ? (
                          <div className="text-center py-8">
                            <Users className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                            <p className="text-stone-600 text-sm">
                              Haz doble clic en las habitaciones del plano para asignar inquilinos
                            </p>
                          </div>
                        ) : (
                          roomAssignments.map((assignment) => (
                            <div key={assignment.id} className="border border-stone-200 rounded-lg p-4 hover:bg-stone-50 transition-colors">
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
                                  {assignment.start_date && (
                                    <p><strong>Desde:</strong> {new Date(assignment.start_date).toLocaleDateString()}</p>
                                  )}
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="templates" className="mt-4">
                    <FloorPlanTemplates onLoadTemplate={handleLoadTemplate} />
                  </TabsContent>
                </Tabs>
              </div>
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