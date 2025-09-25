import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Home, Building, Warehouse } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description: string;
  icon: any;
  roomCount: number;
  data: any;
}

interface FloorPlanTemplatesProps {
  onLoadTemplate: (template: Template) => void;
}

const FloorPlanTemplates = ({ onLoadTemplate }: FloorPlanTemplatesProps) => {
  const templates: Template[] = [
    {
      id: 'apartment-2bed',
      name: 'Apartamento 2 Habitaciones',
      description: 'Plano básico con 2 habitaciones, baño y cocina',
      icon: Home,
      roomCount: 4,
      data: {
        version: '6.0.0',
        objects: [
          // Habitación 1
          {
            type: 'rect',
            left: 50,
            top: 50,
            width: 120,
            height: 100,
            fill: 'rgba(59, 130, 246, 0.3)',
            stroke: '#1e40af',
            strokeWidth: 2
          },
          {
            type: 'text',
            left: 90,
            top: 90,
            text: 'Habitación 1',
            fontSize: 14,
            fill: '#1e40af'
          },
          // Habitación 2
          {
            type: 'rect',
            left: 200,
            top: 50,
            width: 120,
            height: 100,
            fill: 'rgba(59, 130, 246, 0.3)',
            stroke: '#1e40af',
            strokeWidth: 2
          },
          {
            type: 'text',
            left: 240,
            top: 90,
            text: 'Habitación 2',
            fontSize: 14,
            fill: '#1e40af'
          },
          // Baño
          {
            type: 'rect',
            left: 50,
            top: 180,
            width: 80,
            height: 60,
            fill: 'rgba(16, 185, 129, 0.3)',
            stroke: '#065f46',
            strokeWidth: 2
          },
          {
            type: 'text',
            left: 75,
            top: 205,
            text: 'Baño',
            fontSize: 12,
            fill: '#065f46'
          },
          // Cocina
          {
            type: 'rect',
            left: 160,
            top: 180,
            width: 160,
            height: 60,
            fill: 'rgba(245, 158, 11, 0.3)',
            stroke: '#92400e',
            strokeWidth: 2
          },
          {
            type: 'text',
            left: 220,
            top: 205,
            text: 'Cocina/Salón',
            fontSize: 12,
            fill: '#92400e'
          }
        ]
      }
    },
    {
      id: 'studio',
      name: 'Estudio',
      description: 'Espacio diáfano con baño separado',
      icon: Building,
      roomCount: 2,
      data: {
        version: '6.0.0',
        objects: [
          // Área principal
          {
            type: 'rect',
            left: 50,
            top: 50,
            width: 200,
            height: 120,
            fill: 'rgba(139, 92, 246, 0.3)',
            stroke: '#6b21a8',
            strokeWidth: 2
          },
          {
            type: 'text',
            left: 120,
            top: 100,
            text: 'Estudio Principal',
            fontSize: 16,
            fill: '#6b21a8'
          },
          // Baño
          {
            type: 'rect',
            left: 270,
            top: 50,
            width: 60,
            height: 80,
            fill: 'rgba(16, 185, 129, 0.3)',
            stroke: '#065f46',
            strokeWidth: 2
          },
          {
            type: 'text',
            left: 285,
            top: 85,
            text: 'Baño',
            fontSize: 12,
            fill: '#065f46'
          }
        ]
      }
    },
    {
      id: 'shared-house',
      name: 'Casa Compartida',
      description: 'Casa con 4 habitaciones y áreas comunes',
      icon: Warehouse,
      roomCount: 7,
      data: {
        version: '6.0.0',
        objects: [
          // Habitaciones (4)
          {
            type: 'rect',
            left: 50,
            top: 50,
            width: 100,
            height: 80,
            fill: 'rgba(59, 130, 246, 0.3)',
            stroke: '#1e40af',
            strokeWidth: 2
          },
          {
            type: 'text',
            left: 85,
            top: 85,
            text: 'Hab 1',
            fontSize: 12,
            fill: '#1e40af'
          },
          {
            type: 'rect',
            left: 170,
            top: 50,
            width: 100,
            height: 80,
            fill: 'rgba(59, 130, 246, 0.3)',
            stroke: '#1e40af',
            strokeWidth: 2
          },
          {
            type: 'text',
            left: 205,
            top: 85,
            text: 'Hab 2',
            fontSize: 12,
            fill: '#1e40af'
          },
          {
            type: 'rect',
            left: 50,
            top: 150,
            width: 100,
            height: 80,
            fill: 'rgba(59, 130, 246, 0.3)',
            stroke: '#1e40af',
            strokeWidth: 2
          },
          {
            type: 'text',
            left: 85,
            top: 185,
            text: 'Hab 3',
            fontSize: 12,
            fill: '#1e40af'
          },
          {
            type: 'rect',
            left: 170,
            top: 150,
            width: 100,
            height: 80,
            fill: 'rgba(59, 130, 246, 0.3)',
            stroke: '#1e40af',
            strokeWidth: 2
          },
          {
            type: 'text',
            left: 205,
            top: 185,
            text: 'Hab 4',
            fontSize: 12,
            fill: '#1e40af'
          },
          // Áreas comunes
          {
            type: 'rect',
            left: 290,
            top: 50,
            width: 120,
            height: 60,
            fill: 'rgba(245, 158, 11, 0.3)',
            stroke: '#92400e',
            strokeWidth: 2
          },
          {
            type: 'text',
            left: 335,
            top: 75,
            text: 'Cocina',
            fontSize: 12,
            fill: '#92400e'
          },
          {
            type: 'rect',
            left: 290,
            top: 130,
            width: 120,
            height: 60,
            fill: 'rgba(16, 185, 129, 0.3)',
            stroke: '#065f46',
            strokeWidth: 2
          },
          {
            type: 'text',
            left: 335,
            top: 155,
            text: 'Salón',
            fontSize: 12,
            fill: '#065f46'
          },
          // Baños
          {
            type: 'rect',
            left: 290,
            top: 210,
            width: 50,
            height: 40,
            fill: 'rgba(239, 68, 68, 0.3)',
            stroke: '#dc2626',
            strokeWidth: 2
          },
          {
            type: 'text',
            left: 305,
            top: 225,
            text: 'Baño 1',
            fontSize: 10,
            fill: '#dc2626'
          },
          {
            type: 'rect',
            left: 360,
            top: 210,
            width: 50,
            height: 40,
            fill: 'rgba(239, 68, 68, 0.3)',
            stroke: '#dc2626',
            strokeWidth: 2
          },
          {
            type: 'text',
            left: 375,
            top: 225,
            text: 'Baño 2',
            fontSize: 10,
            fill: '#dc2626'
          }
        ]
      }
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Plantillas de Plano</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {templates.map((template) => {
          const Icon = template.icon;
          return (
            <div key={template.id} className="border border-stone-200 rounded-lg p-4 hover:bg-stone-50 transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-stone-100 rounded-lg flex items-center justify-center">
                  <Icon className="w-5 h-5 text-stone-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-stone-900">{template.name}</h4>
                    <Badge variant="secondary" className="text-xs">
                      {template.roomCount} espacios
                    </Badge>
                  </div>
                  <p className="text-sm text-stone-600 mb-3">{template.description}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onLoadTemplate(template)}
                    className="w-full"
                  >
                    Cargar Plantilla
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default FloorPlanTemplates;