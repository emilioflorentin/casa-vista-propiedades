import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  MousePointer,
  Square,
  Circle as CircleIcon,
  Type,
  Minus,
  ArrowRight,
  Eraser,
  Save,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  Grid,
  Layers,
  Download,
  Palette
} from 'lucide-react';

export type ToolType = 'select' | 'rectangle' | 'circle' | 'text' | 'line' | 'arrow' | 'eraser';

interface FloorPlanToolbarProps {
  activeTool: ToolType;
  onToolClick: (tool: ToolType) => void;
  onSave: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onToggleGrid: () => void;
  onExport: () => void;
  showGrid: boolean;
  canUndo: boolean;
  canRedo: boolean;
  zoom: number;
}

const FloorPlanToolbar = ({
  activeTool,
  onToolClick,
  onSave,
  onUndo,
  onRedo,
  onZoomIn,
  onZoomOut,
  onToggleGrid,
  onExport,
  showGrid,
  canUndo,
  canRedo,
  zoom
}: FloorPlanToolbarProps) => {
  const tools = [
    { id: 'select' as const, icon: MousePointer, label: 'Seleccionar' },
    { id: 'rectangle' as const, icon: Square, label: 'Rectángulo' },
    { id: 'circle' as const, icon: CircleIcon, label: 'Círculo' },
    { id: 'line' as const, icon: Minus, label: 'Línea' },
    { id: 'arrow' as const, icon: ArrowRight, label: 'Flecha' },
    { id: 'text' as const, icon: Type, label: 'Texto' },
    { id: 'eraser' as const, icon: Eraser, label: 'Borrar' }
  ];

  return (
    <div className="flex flex-wrap items-center gap-2 p-4 bg-white border border-stone-200 rounded-lg shadow-sm">
      {/* Selection Tools */}
      <div className="flex items-center gap-1">
        {tools.map((tool) => (
          <Button
            key={tool.id}
            size="sm"
            variant={activeTool === tool.id ? 'default' : 'outline'}
            onClick={() => onToolClick(tool.id)}
            className="w-10 h-10 p-0"
            title={tool.label}
          >
            <tool.icon className="w-4 h-4" />
          </Button>
        ))}
      </div>

      <Separator orientation="vertical" className="h-8" />

      {/* History Actions */}
      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant="outline"
          onClick={onUndo}
          disabled={!canUndo}
          className="w-10 h-10 p-0"
          title="Deshacer"
        >
          <Undo className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onRedo}
          disabled={!canRedo}
          className="w-10 h-10 p-0"
          title="Rehacer"
        >
          <Redo className="w-4 h-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-8" />

      {/* View Controls */}
      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant="outline"
          onClick={onZoomOut}
          className="w-10 h-10 p-0"
          title="Alejar"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Badge variant="secondary" className="min-w-16 justify-center">
          {Math.round(zoom * 100)}%
        </Badge>
        <Button
          size="sm"
          variant="outline"
          onClick={onZoomIn}
          className="w-10 h-10 p-0"
          title="Acercar"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant={showGrid ? 'default' : 'outline'}
          onClick={onToggleGrid}
          className="w-10 h-10 p-0"
          title="Mostrar cuadrícula"
        >
          <Grid className="w-4 h-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-8" />

      {/* File Actions */}
      <div className="flex items-center gap-1">
        <Button
          size="sm"
          onClick={onSave}
          className="bg-stone-700 hover:bg-stone-600"
          title="Guardar plano"
        >
          <Save className="w-4 h-4 mr-2" />
          Guardar
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onExport}
          title="Exportar como imagen"
        >
          <Download className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default FloorPlanToolbar;