import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Trash2 } from 'lucide-react';

interface FloorPlanPropertiesProps {
  selectedObject: any;
  onUpdateObject: (properties: any) => void;
  onDeleteObject: () => void;
}

const FloorPlanProperties = ({
  selectedObject,
  onUpdateObject,
  onDeleteObject
}: FloorPlanPropertiesProps) => {
  const [properties, setProperties] = useState({
    fill: '#3b82f6',
    stroke: '#1e40af',
    strokeWidth: 2,
    opacity: 1,
    fontSize: 16,
    fontFamily: 'Arial',
    text: '',
    width: 100,
    height: 100,
    radius: 50
  });

  useEffect(() => {
    if (selectedObject) {
      setProperties({
        fill: selectedObject.fill || '#3b82f6',
        stroke: selectedObject.stroke || '#1e40af',
        strokeWidth: selectedObject.strokeWidth || 2,
        opacity: selectedObject.opacity || 1,
        fontSize: selectedObject.fontSize || 16,
        fontFamily: selectedObject.fontFamily || 'Arial',
        text: selectedObject.text || '',
        width: selectedObject.width || 100,
        height: selectedObject.height || 100,
        radius: selectedObject.radius || 50
      });
    }
  }, [selectedObject]);

  const handlePropertyChange = (key: string, value: any) => {
    const newProperties = { ...properties, [key]: value };
    setProperties(newProperties);
    onUpdateObject({ [key]: value });
  };

  const colorPresets = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', 
    '#8b5cf6', '#ec4899', '#6b7280', '#f97316'
  ];

  if (!selectedObject) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Propiedades
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-stone-600 text-center py-8">
            Selecciona un objeto para editar sus propiedades
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Propiedades
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={onDeleteObject}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Colors */}
        <div className="space-y-3">
          <Label>Color de relleno</Label>
          <div className="flex flex-wrap gap-2">
            {colorPresets.map((color) => (
              <button
                key={color}
                className={`w-8 h-8 rounded-md border-2 ${
                  properties.fill === color ? 'border-stone-400' : 'border-stone-200'
                }`}
                style={{ backgroundColor: color }}
                onClick={() => handlePropertyChange('fill', color)}
              />
            ))}
          </div>
          <Input
            type="color"
            value={properties.fill}
            onChange={(e) => handlePropertyChange('fill', e.target.value)}
            className="w-full h-10"
          />
        </div>

        <div className="space-y-3">
          <Label>Color de borde</Label>
          <Input
            type="color"
            value={properties.stroke}
            onChange={(e) => handlePropertyChange('stroke', e.target.value)}
            className="w-full h-10"
          />
        </div>

        {/* Stroke Width */}
        <div className="space-y-3">
          <Label>Grosor del borde: {properties.strokeWidth}px</Label>
          <Slider
            value={[properties.strokeWidth]}
            onValueChange={([value]) => handlePropertyChange('strokeWidth', value)}
            min={0}
            max={10}
            step={1}
            className="w-full"
          />
        </div>

        {/* Opacity */}
        <div className="space-y-3">
          <Label>Opacidad: {Math.round(properties.opacity * 100)}%</Label>
          <Slider
            value={[properties.opacity]}
            onValueChange={([value]) => handlePropertyChange('opacity', value)}
            min={0}
            max={1}
            step={0.1}
            className="w-full"
          />
        </div>

        {/* Text Properties */}
        {selectedObject.type === 'text' && (
          <>
            <div className="space-y-2">
              <Label htmlFor="text">Texto</Label>
              <Input
                id="text"
                value={properties.text}
                onChange={(e) => handlePropertyChange('text', e.target.value)}
                placeholder="Escribir texto..."
              />
            </div>
            
            <div className="space-y-3">
              <Label>Tamaño de fuente: {properties.fontSize}px</Label>
              <Slider
                value={[properties.fontSize]}
                onValueChange={([value]) => handlePropertyChange('fontSize', value)}
                min={8}
                max={72}
                step={2}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fontFamily">Fuente</Label>
              <Select value={properties.fontFamily} onValueChange={(value) => handlePropertyChange('fontFamily', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Arial">Arial</SelectItem>
                  <SelectItem value="Helvetica">Helvetica</SelectItem>
                  <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                  <SelectItem value="Courier New">Courier New</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {/* Size Properties */}
        {(selectedObject.type === 'rect' || selectedObject.type === 'circle') && (
          <>
            {selectedObject.type === 'rect' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="width">Ancho</Label>
                  <Input
                    id="width"
                    type="number"
                    value={properties.width}
                    onChange={(e) => handlePropertyChange('width', parseFloat(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Alto</Label>
                  <Input
                    id="height"
                    type="number"
                    value={properties.height}
                    onChange={(e) => handlePropertyChange('height', parseFloat(e.target.value))}
                  />
                </div>
              </>
            )}
            
            {selectedObject.type === 'circle' && (
              <div className="space-y-2">
                <Label htmlFor="radius">Radio</Label>
                <Input
                  id="radius"
                  type="number"
                  value={properties.radius}
                  onChange={(e) => handlePropertyChange('radius', parseFloat(e.target.value))}
                />
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default FloorPlanProperties;