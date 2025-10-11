import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface RoomFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: {
    room_name: string;
    room_type: string;
    room_size: string;
    tenant_name: string;
    tenant_phone: string;
    tenant_email: string;
    rent_amount: string;
    start_date: string;
    end_date: string;
  };
  onFormChange: (field: string, value: string) => void;
  onSave: () => void;
  isEditing: boolean;
}

export const RoomFormDialog = ({
  open,
  onOpenChange,
  formData,
  onFormChange,
  onSave,
  isEditing
}: RoomFormDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar' : 'Nueva'} Habitación</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="room_name">Nombre de la Habitación *</Label>
              <Input
                id="room_name"
                value={formData.room_name}
                onChange={(e) => onFormChange('room_name', e.target.value)}
                placeholder="Ej: Habitación 1, Suite principal"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="room_type">Tipo *</Label>
              <Select value={formData.room_type} onValueChange={(val) => onFormChange('room_type', val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bedroom">Dormitorio</SelectItem>
                  <SelectItem value="living">Sala de estar</SelectItem>
                  <SelectItem value="kitchen">Cocina</SelectItem>
                  <SelectItem value="bathroom">Baño</SelectItem>
                  <SelectItem value="office">Oficina</SelectItem>
                  <SelectItem value="storage">Almacén</SelectItem>
                  <SelectItem value="other">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="room_size">Tamaño (m²)</Label>
            <Input
              id="room_size"
              type="number"
              value={formData.room_size}
              onChange={(e) => onFormChange('room_size', e.target.value)}
              placeholder="Ej: 15"
            />
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">Información del Inquilino (opcional)</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tenant_name">Nombre del Inquilino</Label>
                <Input
                  id="tenant_name"
                  value={formData.tenant_name}
                  onChange={(e) => onFormChange('tenant_name', e.target.value)}
                  placeholder="Nombre completo"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tenant_phone">Teléfono</Label>
                  <Input
                    id="tenant_phone"
                    value={formData.tenant_phone}
                    onChange={(e) => onFormChange('tenant_phone', e.target.value)}
                    placeholder="Número de teléfono"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tenant_email">Email</Label>
                  <Input
                    id="tenant_email"
                    type="email"
                    value={formData.tenant_email}
                    onChange={(e) => onFormChange('tenant_email', e.target.value)}
                    placeholder="correo@ejemplo.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rent_amount">Renta Mensual (€)</Label>
                <Input
                  id="rent_amount"
                  type="number"
                  value={formData.rent_amount}
                  onChange={(e) => onFormChange('rent_amount', e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Fecha Inicio</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => onFormChange('start_date', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">Fecha Fin</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => onFormChange('end_date', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={onSave} className="flex-1">
              {isEditing ? 'Actualizar' : 'Crear'} Habitación
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
