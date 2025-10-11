import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Edit, Trash2, Home } from 'lucide-react';

interface RoomCardProps {
  room: {
    id: string;
    room_name: string;
    room_type: string;
    room_size?: number;
    tenant_name?: string;
    tenant_phone?: string;
    tenant_email?: string;
    rent_amount?: number;
    start_date?: string;
    end_date?: string;
  };
  onEdit: () => void;
  onDelete: () => void;
}

export const RoomCard = ({ room, onEdit, onDelete }: RoomCardProps) => {
  const isOccupied = !!room.tenant_name;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Home className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">{room.room_name}</CardTitle>
          </div>
          <Badge variant={isOccupied ? "destructive" : "secondary"}>
            {isOccupied ? "Ocupada" : "Disponible"}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{room.room_type}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {room.room_size && (
          <p className="text-sm"><strong>Tamaño:</strong> {room.room_size}m²</p>
        )}
        
        {isOccupied && (
          <div className="border-t pt-3 space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <p><strong>Inquilino:</strong> {room.tenant_name}</p>
            </div>
            {room.tenant_phone && (
              <p><strong>Teléfono:</strong> {room.tenant_phone}</p>
            )}
            {room.tenant_email && (
              <p><strong>Email:</strong> {room.tenant_email}</p>
            )}
            {room.rent_amount && (
              <p className="text-primary font-semibold">
                <strong>Renta:</strong> €{room.rent_amount}/mes
              </p>
            )}
            {room.start_date && (
              <p><strong>Desde:</strong> {new Date(room.start_date).toLocaleDateString('es-ES')}</p>
            )}
            {room.end_date && (
              <p><strong>Hasta:</strong> {new Date(room.end_date).toLocaleDateString('es-ES')}</p>
            )}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button onClick={onEdit} variant="outline" size="sm" className="flex-1">
            <Edit className="w-4 h-4 mr-1" />
            Editar
          </Button>
          <Button onClick={onDelete} variant="outline" size="sm">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
