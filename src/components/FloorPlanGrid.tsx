import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Home, Move, Save, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FloorPlanRoom {
  id: string;
  room_id: string;
  room_name: string;
  room_type: string;
  room_size: number | null;
  tenant_name: string | null;
  rent_amount: number | null;
}

interface RoomPosition {
  id: string;
  x: number;
  y: number;
}

interface FloorPlanGridProps {
  rooms: FloorPlanRoom[];
  savedPositions?: Record<string, { x: number; y: number }>;
  onSaveLayout: (positions: Record<string, { x: number; y: number }>) => void;
  onRoomClick?: (room: FloorPlanRoom) => void;
}

const GRID_SIZE = 20;
const CARD_WIDTH = 140;
const CARD_HEIGHT = 100;

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

const getRoomTypeColor = (type: string, isOccupied: boolean): string => {
  if (isOccupied) {
    return 'bg-emerald-100 border-emerald-400 hover:bg-emerald-200';
  }
  
  const colors: Record<string, string> = {
    bedroom: 'bg-blue-50 border-blue-300 hover:bg-blue-100',
    bathroom: 'bg-teal-50 border-teal-300 hover:bg-teal-100',
    kitchen: 'bg-amber-50 border-amber-300 hover:bg-amber-100',
    living: 'bg-purple-50 border-purple-300 hover:bg-purple-100',
    storage: 'bg-stone-50 border-stone-300 hover:bg-stone-100',
    other: 'bg-gray-50 border-gray-300 hover:bg-gray-100'
  };
  return colors[type] || colors.other;
};

const FloorPlanGrid = ({ rooms, savedPositions = {}, onSaveLayout, onRoomClick }: FloorPlanGridProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize positions from saved or auto-arrange
  useEffect(() => {
    const initialPositions: Record<string, { x: number; y: number }> = {};
    
    rooms.forEach((room, index) => {
      if (savedPositions[room.id]) {
        initialPositions[room.id] = savedPositions[room.id];
      } else {
        // Auto-arrange in a grid
        const cols = 4;
        const col = index % cols;
        const row = Math.floor(index / cols);
        initialPositions[room.id] = {
          x: col * (CARD_WIDTH + GRID_SIZE) + GRID_SIZE,
          y: row * (CARD_HEIGHT + GRID_SIZE) + GRID_SIZE
        };
      }
    });
    
    setPositions(initialPositions);
  }, [rooms, savedPositions]);

  const snapToGrid = (value: number): number => {
    return Math.round(value / GRID_SIZE) * GRID_SIZE;
  };

  const handleMouseDown = (e: React.MouseEvent, roomId: string) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const pos = positions[roomId] || { x: 0, y: 0 };
    
    setDragging(roomId);
    setDragOffset({
      x: e.clientX - rect.left - pos.x,
      y: e.clientY - rect.top - pos.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const newX = snapToGrid(e.clientX - rect.left - dragOffset.x);
    const newY = snapToGrid(e.clientY - rect.top - dragOffset.y);
    
    // Keep within bounds
    const boundedX = Math.max(0, Math.min(newX, rect.width - CARD_WIDTH));
    const boundedY = Math.max(0, Math.min(newY, rect.height - CARD_HEIGHT));
    
    setPositions(prev => ({
      ...prev,
      [dragging]: { x: boundedX, y: boundedY }
    }));
    setHasChanges(true);
  };

  const handleMouseUp = () => {
    setDragging(null);
  };

  const handleSave = () => {
    onSaveLayout(positions);
    setHasChanges(false);
  };

  const handleReset = () => {
    const resetPositions: Record<string, { x: number; y: number }> = {};
    rooms.forEach((room, index) => {
      const cols = 4;
      const col = index % cols;
      const row = Math.floor(index / cols);
      resetPositions[room.id] = {
        x: col * (CARD_WIDTH + GRID_SIZE) + GRID_SIZE,
        y: row * (CARD_HEIGHT + GRID_SIZE) + GRID_SIZE
      };
    });
    setPositions(resetPositions);
    setHasChanges(true);
  };

  const occupiedCount = rooms.filter(r => r.tenant_name).length;
  const availableCount = rooms.length - occupiedCount;

  if (rooms.length === 0) {
    return (
      <Card className="bg-stone-50 border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Home className="w-12 h-12 text-stone-400 mb-4" />
          <h3 className="text-lg font-medium text-stone-700 mb-2">
            Sin habitaciones
          </h3>
          <p className="text-stone-500 max-w-sm">
            Añade habitaciones para ver la distribución visual de la vivienda
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Legend and controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-emerald-200 border border-emerald-400" />
            <span className="text-sm text-stone-600">Ocupada ({occupiedCount})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-100 border border-blue-300" />
            <span className="text-sm text-stone-600">Disponible ({availableCount})</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleReset}
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reorganizar
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!hasChanges}
            className="gap-2"
          >
            <Save className="w-4 h-4" />
            Guardar disposición
          </Button>
        </div>
      </div>

      {/* Grid area */}
      <div
        ref={containerRef}
        className="relative bg-stone-100 rounded-xl border-2 border-dashed border-stone-300 overflow-hidden"
        style={{ 
          minHeight: '400px',
          backgroundImage: `
            linear-gradient(to right, hsl(var(--border) / 0.3) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--border) / 0.3) 1px, transparent 1px)
          `,
          backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {rooms.map((room) => {
          const pos = positions[room.id] || { x: 0, y: 0 };
          const isOccupied = !!room.tenant_name;
          const isDragging = dragging === room.id;
          
          return (
            <div
              key={room.id}
              className={cn(
                'absolute cursor-grab transition-shadow rounded-lg border-2 shadow-sm',
                getRoomTypeColor(room.room_type, isOccupied),
                isDragging && 'cursor-grabbing shadow-lg z-10 ring-2 ring-primary/50'
              )}
              style={{
                left: pos.x,
                top: pos.y,
                width: CARD_WIDTH,
                height: CARD_HEIGHT,
                transition: isDragging ? 'none' : 'box-shadow 0.2s'
              }}
              onMouseDown={(e) => handleMouseDown(e, room.id)}
              onClick={() => !isDragging && onRoomClick?.(room)}
            >
              <div className="p-3 h-full flex flex-col">
                <div className="flex items-start justify-between mb-1">
                  <span className="font-medium text-sm text-stone-800 truncate flex-1">
                    {room.room_name}
                  </span>
                  <Move className="w-3 h-3 text-stone-400 flex-shrink-0" />
                </div>
                
                <Badge 
                  variant="secondary" 
                  className="text-xs w-fit mb-auto"
                >
                  {getRoomTypeLabel(room.room_type)}
                </Badge>
                
                <div className="mt-auto">
                  {isOccupied ? (
                    <div className="flex items-center gap-1 text-xs text-emerald-700">
                      <User className="w-3 h-3" />
                      <span className="truncate">{room.tenant_name}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-stone-500">Disponible</span>
                  )}
                  
                  {room.rent_amount && (
                    <div className="text-xs font-medium text-stone-700">
                      {room.rent_amount}€/mes
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <p className="text-xs text-stone-500 text-center">
        Arrastra las habitaciones para organizar la distribución visual de la vivienda
      </p>
    </div>
  );
};

export default FloorPlanGrid;
