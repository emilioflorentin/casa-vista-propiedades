import { useEffect, useRef, useState, useCallback } from 'react';
import { Canvas as FabricCanvas, Rect, Circle, IText, Line, FabricObject } from 'fabric';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  MousePointer,
  Square,
  Circle as CircleIcon,
  Type,
  Minus,
  Trash2,
  Save,
  Undo,
  ZoomIn,
  ZoomOut,
  Grid,
  RotateCcw,
  DoorOpen,
  Link2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Room {
  id: string;
  room_name: string;
  room_type: string;
  tenant_name?: string | null;
}

interface FloorPlanEditorProps {
  rooms: Room[];
  propertyId: string;
  savedFloorPlan?: string | null;
  onSave: (floorPlanData: string) => void;
}

type ToolType = 'select' | 'room' | 'wall' | 'door' | 'text' | 'delete';

const ROOM_COLORS: Record<string, { fill: string; stroke: string }> = {
  bedroom: { fill: 'rgba(59, 130, 246, 0.3)', stroke: '#1e40af' },
  bathroom: { fill: 'rgba(20, 184, 166, 0.3)', stroke: '#0f766e' },
  kitchen: { fill: 'rgba(245, 158, 11, 0.3)', stroke: '#b45309' },
  living: { fill: 'rgba(168, 85, 247, 0.3)', stroke: '#7c3aed' },
  storage: { fill: 'rgba(107, 114, 128, 0.3)', stroke: '#4b5563' },
  other: { fill: 'rgba(156, 163, 175, 0.3)', stroke: '#6b7280' },
  occupied: { fill: 'rgba(34, 197, 94, 0.4)', stroke: '#15803d' }
};

const getRoomTypeLabel = (type: string): string => {
  const types: Record<string, string> = {
    bedroom: 'Dormitorio',
    bathroom: 'Baño',
    kitchen: 'Cocina',
    living: 'Salón',
    storage: 'Trastero',
    other: 'Otro'
  };
  return types[type] || type;
};

const FloorPlanEditor = ({ rooms, propertyId, savedFloorPlan, onSave }: FloorPlanEditorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [activeTool, setActiveTool] = useState<ToolType>('select');
  const [selectedObject, setSelectedObject] = useState<FabricObject | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [selectedRoomType, setSelectedRoomType] = useState('bedroom');
  const [linkedRoomId, setLinkedRoomId] = useState<string>('');
  const [roomWidth, setRoomWidth] = useState(120);
  const [roomHeight, setRoomHeight] = useState(100);
  const { toast } = useToast();

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = 500;

    const canvas = new FabricCanvas(canvasRef.current, {
      width,
      height,
      backgroundColor: '#fafaf9',
      selection: true
    });

    canvas.on('selection:created', (e) => {
      setSelectedObject(e.selected?.[0] || null);
    });

    canvas.on('selection:updated', (e) => {
      setSelectedObject(e.selected?.[0] || null);
    });

    canvas.on('selection:cleared', () => {
      setSelectedObject(null);
      setLinkedRoomId('');
    });

    setFabricCanvas(canvas);

    // Load saved floor plan
    if (savedFloorPlan) {
      try {
        canvas.loadFromJSON(JSON.parse(savedFloorPlan)).then(() => {
          canvas.renderAll();
        });
      } catch (e) {
        console.error('Error loading floor plan:', e);
      }
    }

    return () => {
      canvas.dispose();
    };
  }, []);

  // Draw grid
  useEffect(() => {
    if (!fabricCanvas) return;

    // Remove existing grid lines
    const objects = fabricCanvas.getObjects();
    objects.forEach(obj => {
      if ((obj as any).isGridLine) {
        fabricCanvas.remove(obj);
      }
    });

    if (showGrid) {
      const gridSize = 20;
      const width = fabricCanvas.width || 800;
      const height = fabricCanvas.height || 500;

      // Vertical lines
      for (let i = 0; i <= width; i += gridSize) {
        const line = new Line([i, 0, i, height], {
          stroke: '#e7e5e4',
          strokeWidth: 1,
          selectable: false,
          evented: false
        });
        (line as any).isGridLine = true;
        fabricCanvas.add(line);
        fabricCanvas.sendObjectToBack(line);
      }

      // Horizontal lines
      for (let i = 0; i <= height; i += gridSize) {
        const line = new Line([0, i, width, i], {
          stroke: '#e7e5e4',
          strokeWidth: 1,
          selectable: false,
          evented: false
        });
        (line as any).isGridLine = true;
        fabricCanvas.add(line);
        fabricCanvas.sendObjectToBack(line);
      }
    }

    fabricCanvas.renderAll();
  }, [fabricCanvas, showGrid]);

  // Update selected object when linked room changes
  useEffect(() => {
    if (!selectedObject || !fabricCanvas) return;

    const room = rooms.find(r => r.id === linkedRoomId);
    if (room) {
      const isOccupied = !!room.tenant_name;
      const colors = isOccupied ? ROOM_COLORS.occupied : ROOM_COLORS[room.room_type] || ROOM_COLORS.other;
      
      selectedObject.set({
        fill: colors.fill,
        stroke: colors.stroke
      });
      (selectedObject as any).linkedRoomId = linkedRoomId;
      (selectedObject as any).roomName = room.room_name;
      
      fabricCanvas.renderAll();
    }
  }, [linkedRoomId, selectedObject, fabricCanvas, rooms]);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (!fabricCanvas || activeTool === 'select') return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (activeTool === 'room') {
      const colors = ROOM_COLORS[selectedRoomType] || ROOM_COLORS.other;
      const room = new Rect({
        left: x - roomWidth / 2,
        top: y - roomHeight / 2,
        width: roomWidth,
        height: roomHeight,
        fill: colors.fill,
        stroke: colors.stroke,
        strokeWidth: 2,
        rx: 4,
        ry: 4
      });
      (room as any).objectType = 'room';
      (room as any).roomType = selectedRoomType;
      fabricCanvas.add(room);
      fabricCanvas.setActiveObject(room);
      setSelectedObject(room);
      setActiveTool('select');
    } else if (activeTool === 'wall') {
      const wall = new Rect({
        left: x,
        top: y,
        width: 100,
        height: 8,
        fill: '#78716c',
        stroke: '#57534e',
        strokeWidth: 1
      });
      (wall as any).objectType = 'wall';
      fabricCanvas.add(wall);
      fabricCanvas.setActiveObject(wall);
      setActiveTool('select');
    } else if (activeTool === 'door') {
      const door = new Rect({
        left: x,
        top: y,
        width: 40,
        height: 6,
        fill: '#fbbf24',
        stroke: '#d97706',
        strokeWidth: 1
      });
      (door as any).objectType = 'door';
      fabricCanvas.add(door);
      fabricCanvas.setActiveObject(door);
      setActiveTool('select');
    } else if (activeTool === 'text') {
      const text = new IText('Texto', {
        left: x,
        top: y,
        fontSize: 16,
        fill: '#44403c',
        fontFamily: 'Arial'
      });
      fabricCanvas.add(text);
      fabricCanvas.setActiveObject(text);
      setActiveTool('select');
    }

    fabricCanvas.renderAll();
  }, [fabricCanvas, activeTool, selectedRoomType, roomWidth, roomHeight]);

  const handleDelete = () => {
    if (!fabricCanvas || !selectedObject) return;
    fabricCanvas.remove(selectedObject);
    setSelectedObject(null);
    fabricCanvas.renderAll();
  };

  const handleClear = () => {
    if (!fabricCanvas) return;
    const objects = fabricCanvas.getObjects().filter(obj => !(obj as any).isGridLine);
    objects.forEach(obj => fabricCanvas.remove(obj));
    fabricCanvas.renderAll();
    toast({
      title: 'Plano limpiado',
      description: 'Se han eliminado todos los elementos'
    });
  };

  const handleZoomIn = () => {
    if (!fabricCanvas) return;
    const newZoom = Math.min(zoom * 1.2, 3);
    fabricCanvas.setZoom(newZoom);
    setZoom(newZoom);
  };

  const handleZoomOut = () => {
    if (!fabricCanvas) return;
    const newZoom = Math.max(zoom / 1.2, 0.5);
    fabricCanvas.setZoom(newZoom);
    setZoom(newZoom);
  };

  const handleSave = () => {
    if (!fabricCanvas) return;
    
    // Remove grid lines before saving
    const objects = fabricCanvas.getObjects();
    const gridLines = objects.filter(obj => (obj as any).isGridLine);
    gridLines.forEach(obj => fabricCanvas.remove(obj));
    
    const json = JSON.stringify(fabricCanvas.toJSON());
    
    // Restore grid lines
    if (showGrid) {
      // Grid will be redrawn by useEffect
    }
    
    onSave(json);
    
    // Redraw grid
    setShowGrid(prev => {
      setTimeout(() => setShowGrid(prev), 0);
      return false;
    });
  };

  const tools = [
    { id: 'select' as const, icon: MousePointer, label: 'Seleccionar' },
    { id: 'room' as const, icon: Square, label: 'Habitación' },
    { id: 'wall' as const, icon: Minus, label: 'Pared' },
    { id: 'door' as const, icon: DoorOpen, label: 'Puerta' },
    { id: 'text' as const, icon: Type, label: 'Texto' },
    { id: 'delete' as const, icon: Trash2, label: 'Eliminar' }
  ];

  const unlinkedRooms = rooms.filter(r => {
    if (!fabricCanvas) return true;
    const objects = fabricCanvas.getObjects();
    return !objects.some(obj => (obj as any).linkedRoomId === r.id);
  });

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 p-4 bg-white border border-stone-200 rounded-lg shadow-sm">
        <div className="flex items-center gap-1">
          {tools.map((tool) => (
            <Button
              key={tool.id}
              size="sm"
              variant={activeTool === tool.id ? 'default' : 'outline'}
              onClick={() => {
                if (tool.id === 'delete' && selectedObject) {
                  handleDelete();
                } else {
                  setActiveTool(tool.id);
                }
              }}
              className="w-10 h-10 p-0"
              title={tool.label}
            >
              <tool.icon className="w-4 h-4" />
            </Button>
          ))}
        </div>

        <Separator orientation="vertical" className="h-8" />

        {/* Room type selector - show when room tool is active */}
        {activeTool === 'room' && (
          <div className="flex items-center gap-2">
            <Select value={selectedRoomType} onValueChange={setSelectedRoomType}>
              <SelectTrigger className="w-32 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bedroom">Dormitorio</SelectItem>
                <SelectItem value="bathroom">Baño</SelectItem>
                <SelectItem value="kitchen">Cocina</SelectItem>
                <SelectItem value="living">Salón</SelectItem>
                <SelectItem value="storage">Trastero</SelectItem>
                <SelectItem value="other">Otro</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="number"
              value={roomWidth}
              onChange={(e) => setRoomWidth(parseInt(e.target.value) || 100)}
              className="w-16 h-9"
              title="Ancho"
            />
            <span className="text-sm text-muted-foreground">×</span>
            <Input
              type="number"
              value={roomHeight}
              onChange={(e) => setRoomHeight(parseInt(e.target.value) || 100)}
              className="w-16 h-9"
              title="Alto"
            />
          </div>
        )}

        <div className="flex-1" />

        {/* View controls */}
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="outline"
            onClick={handleZoomOut}
            className="w-9 h-9 p-0"
            title="Alejar"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Badge variant="secondary" className="min-w-14 justify-center">
            {Math.round(zoom * 100)}%
          </Badge>
          <Button
            size="sm"
            variant="outline"
            onClick={handleZoomIn}
            className="w-9 h-9 p-0"
            title="Acercar"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant={showGrid ? 'default' : 'outline'}
            onClick={() => setShowGrid(!showGrid)}
            className="w-9 h-9 p-0"
            title="Cuadrícula"
          >
            <Grid className="w-4 h-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-8" />

        {/* Actions */}
        <Button size="sm" variant="outline" onClick={handleClear} className="gap-2">
          <RotateCcw className="w-4 h-4" />
          Limpiar
        </Button>
        <Button size="sm" onClick={handleSave} className="gap-2">
          <Save className="w-4 h-4" />
          Guardar
        </Button>
      </div>

      <div className="flex gap-4">
        {/* Canvas */}
        <div 
          ref={containerRef}
          className="flex-1 border-2 border-stone-200 rounded-xl overflow-hidden bg-white"
          onClick={handleCanvasClick}
        >
          <canvas ref={canvasRef} className="w-full" />
        </div>

        {/* Properties Panel */}
        <Card className="w-72 flex-shrink-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Propiedades</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedObject && (selectedObject as any).objectType === 'room' ? (
              <>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Link2 className="w-4 h-4" />
                    Vincular habitación
                  </Label>
                  {rooms.length === 0 ? (
                    <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                      No hay habitaciones creadas. Crea habitaciones en la pestaña "Vista Lista" primero.
                    </p>
                  ) : (
                    <Select 
                      value={linkedRoomId || (selectedObject as any).linkedRoomId || 'none'} 
                      onValueChange={(val) => setLinkedRoomId(val === 'none' ? '' : val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar habitación..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sin vincular</SelectItem>
                        {rooms.map(room => (
                          <SelectItem key={room.id} value={room.id}>
                            <div className="flex items-center gap-2">
                              <span>{room.room_name}</span>
                              {room.tenant_name && (
                                <Badge variant="secondary" className="text-xs">
                                  Ocupada
                                </Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {(selectedObject as any).linkedRoomId && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm font-medium text-green-800">{(selectedObject as any).roomName}</p>
                    <p className="text-xs text-green-600">
                      {getRoomTypeLabel((selectedObject as any).roomType)} - Vinculada ✓
                    </p>
                  </div>
                )}

                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleDelete}
                  className="w-full"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar
                </Button>
              </>
            ) : selectedObject ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Elemento: {(selectedObject as any).objectType || 'forma'}
                </p>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleDelete}
                  className="w-full"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar
                </Button>
              </div>
            ) : (
              <div className="text-center py-4 space-y-3">
                <p className="text-sm text-muted-foreground">
                  Selecciona un elemento para ver sus propiedades
                </p>
                <div className="text-xs text-left bg-stone-50 p-3 rounded-lg space-y-2">
                  <p className="font-medium text-stone-700">Cómo vincular habitaciones:</p>
                  <ol className="list-decimal list-inside space-y-1 text-stone-600">
                    <li>Selecciona la herramienta "Habitación"</li>
                    <li>Haz clic en el plano para crear un rectángulo</li>
                    <li>Selecciona el rectángulo creado</li>
                    <li>Usa el selector "Vincular habitación" aquí</li>
                  </ol>
                </div>
              </div>
            )}

            <Separator />

            {/* Legend */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Leyenda</Label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: ROOM_COLORS.occupied.fill, border: `2px solid ${ROOM_COLORS.occupied.stroke}` }} />
                  <span>Ocupada</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: ROOM_COLORS.bedroom.fill, border: `2px solid ${ROOM_COLORS.bedroom.stroke}` }} />
                  <span>Dormitorio</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: ROOM_COLORS.bathroom.fill, border: `2px solid ${ROOM_COLORS.bathroom.stroke}` }} />
                  <span>Baño</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: ROOM_COLORS.kitchen.fill, border: `2px solid ${ROOM_COLORS.kitchen.stroke}` }} />
                  <span>Cocina</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: ROOM_COLORS.living.fill, border: `2px solid ${ROOM_COLORS.living.stroke}` }} />
                  <span>Salón</span>
                </div>
              </div>
            </div>

            {/* Unlinked rooms */}
            {unlinkedRooms.length > 0 && (
              <>
                <Separator />
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Habitaciones sin vincular
                  </Label>
                  <div className="space-y-1">
                    {unlinkedRooms.map(room => (
                      <div 
                        key={room.id} 
                        className="text-xs p-2 bg-amber-50 border border-amber-200 rounded flex items-center justify-between"
                      >
                        <span>{room.room_name}</span>
                        <Badge variant="outline" className="text-xs">
                          {getRoomTypeLabel(room.room_type)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Haz clic en el canvas para añadir elementos. Selecciona herramientas de la barra superior.
      </p>
    </div>
  );
};

export default FloorPlanEditor;
