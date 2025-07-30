import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Upload, X, Plus, Image as ImageIcon } from 'lucide-react';
import { LocalProperty } from '@/utils/localProperties';

interface PropertyFormProps {
  propertyForm: {
    title: string;
    type: "apartment" | "house" | "loft" | "studio";
    price: string;
    currency: string;
    operation: "rent" | "sale";
    location: string;
    bedrooms: string;
    bathrooms: string;
    area: string;
    description: string;
    features: string[];
    images: File[];
  };
  editingProperty: LocalProperty | null;
  isUploading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  onFormChange: (field: string, value: any) => void;
}

const predefinedFeatures = [
  "Aire acondicionado",
  "Calefacción", 
  "Parking",
  "Terraza",
  "Balcón",
  "Jardín",
  "Piscina",
  "Ascensor",
  "Amueblado",
  "Cocina equipada",
  "Lavadero",
  "Trastero",
  "Chimenea",
  "Suelo de parquet",
  "Suelo de mármol",
  "Ventanas de aluminio",
  "Puerta blindada",
  "Videoportero",
  "Conserje",
  "Zona verde",
  "Cerca del metro",
  "Cerca de colegios",
  "Zona comercial",
  "Vista al mar",
  "Vista a la montaña",
  "Luminoso",
  "Exterior",
  "Reformado",
  "A estrenar"
];

export function PropertyForm({ 
  propertyForm, 
  editingProperty, 
  isUploading, 
  onSubmit, 
  onCancel, 
  onFormChange 
}: PropertyFormProps) {
  const [customFeature, setCustomFeature] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onFormChange(name, value);
  };

  const handleSelectChange = (name: string, value: string) => {
    onFormChange(name, value);
  };

  const handleFeatureToggle = (feature: string, checked: boolean) => {
    if (checked) {
      if (!propertyForm.features.includes(feature)) {
        onFormChange('features', [...propertyForm.features, feature]);
      }
    } else {
      onFormChange('features', propertyForm.features.filter(f => f !== feature));
    }
  };

  const handleCustomFeatureAdd = () => {
    if (customFeature.trim() && !propertyForm.features.includes(customFeature.trim())) {
      onFormChange('features', [...propertyForm.features, customFeature.trim()]);
      setCustomFeature("");
    }
  };

  const handleFeatureRemove = (feature: string) => {
    onFormChange('features', propertyForm.features.filter(f => f !== feature));
  };

  const handleImageAdd = (files: FileList | null) => {
    if (files) {
      const newImages = Array.from(files);
      onFormChange('images', [...propertyForm.images, ...newImages]);
    }
  };

  const handleImageRemove = (index: number) => {
    const newImages = propertyForm.images.filter((_, i) => i !== index);
    onFormChange('images', newImages);
  };

  return (
    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>
          {editingProperty ? 'Editar Propiedad' : 'Publicar Nueva Propiedad'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700">
                Título *
              </label>
              <Input
                name="title"
                value={propertyForm.title}
                onChange={handleInputChange}
                placeholder="Ej: Apartamento luminoso en el centro"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700">
                Tipo de propiedad
              </label>
              <Select value={propertyForm.type} onValueChange={(value) => handleSelectChange('type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="apartment">Apartamento</SelectItem>
                  <SelectItem value="house">Casa</SelectItem>
                  <SelectItem value="loft">Loft</SelectItem>
                  <SelectItem value="studio">Estudio</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700">
                Operación
              </label>
              <Select value={propertyForm.operation} onValueChange={(value) => handleSelectChange('operation', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rent">Alquiler</SelectItem>
                  <SelectItem value="sale">Venta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700">
                Ubicación *
              </label>
              <Input
                name="location"
                value={propertyForm.location}
                onChange={handleInputChange}
                placeholder="Ej: Madrid, Centro"
                required
              />
            </div>

            <div className="flex gap-2">
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium text-stone-700">
                  Precio *
                </label>
                <Input
                  name="price"
                  type="number"
                  value={propertyForm.price}
                  onChange={handleInputChange}
                  placeholder="1200"
                  required
                />
              </div>
              <div className="w-20 space-y-2">
                <label className="text-sm font-medium text-stone-700">
                  Moneda
                </label>
                <Select value={propertyForm.currency} onValueChange={(value) => handleSelectChange('currency', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EUR">€</SelectItem>
                    <SelectItem value="USD">$</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700">
                Área (m²) *
              </label>
              <Input
                name="area"
                type="number"
                value={propertyForm.area}
                onChange={handleInputChange}
                placeholder="85"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700">
                Habitaciones
              </label>
              <Select value={propertyForm.bedrooms} onValueChange={(value) => handleSelectChange('bedrooms', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1,2,3,4,5,6].map(num => (
                    <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700">
                Baños
              </label>
              <Select value={propertyForm.bathrooms} onValueChange={(value) => handleSelectChange('bathrooms', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1,2,3,4,5,6].map(num => (
                    <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-stone-700">
              Descripción
            </label>
            <Textarea
              name="description"
              value={propertyForm.description}
              onChange={handleInputChange}
              placeholder="Describe las características principales de tu propiedad..."
              rows={4}
            />
          </div>

          {/* Características predefinidas */}
          <div className="space-y-4">
            <label className="text-sm font-medium text-stone-700">
              Características
            </label>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {predefinedFeatures.map((feature) => (
                <div key={feature} className="flex items-center space-x-2">
                  <Checkbox 
                    id={feature}
                    checked={propertyForm.features.includes(feature)}
                    onCheckedChange={(checked) => handleFeatureToggle(feature, checked as boolean)}
                  />
                  <label 
                    htmlFor={feature} 
                    className="text-sm text-stone-700 cursor-pointer"
                  >
                    {feature}
                  </label>
                </div>
              ))}
            </div>

            {/* Características personalizadas */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700">
                Añadir característica personalizada
              </label>
              <div className="flex gap-2">
                <Input
                  value={customFeature}
                  onChange={(e) => setCustomFeature(e.target.value)}
                  placeholder="Ej: Gimnasio privado"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleCustomFeatureAdd();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCustomFeatureAdd}
                  disabled={!customFeature.trim()}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Características seleccionadas */}
            {propertyForm.features.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-stone-700">
                  Características seleccionadas
                </label>
                <div className="flex flex-wrap gap-2">
                  {propertyForm.features.map((feature, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {feature}
                      <button
                        type="button"
                        onClick={() => handleFeatureRemove(feature)}
                        className="ml-1 text-red-500 hover:text-red-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Subida múltiple de imágenes */}
          <div className="space-y-4">
            <label className="text-sm font-medium text-stone-700">
              Imágenes de la propiedad
            </label>
            
            <div className="border-2 border-dashed border-stone-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleImageAdd(e.target.files)}
                className="hidden"
                id="property-images"
              />
              <label htmlFor="property-images" className="cursor-pointer">
                <Upload className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                <p className="text-stone-600">
                  {propertyForm.images.length > 0 
                    ? `${propertyForm.images.length} imagen(es) seleccionada(s)` 
                    : 'Selecciona múltiples imágenes'}
                </p>
                <p className="text-xs text-stone-500 mt-1">
                  Puedes seleccionar varias imágenes a la vez
                </p>
              </label>
            </div>

            {/* Preview de imágenes */}
            {propertyForm.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {propertyForm.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square bg-stone-200 rounded-lg overflow-hidden">
                      <img 
                        src={URL.createObjectURL(image)} 
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleImageRemove(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <p className="text-xs text-stone-500 mt-1 truncate">
                      {image.name}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isUploading}
              className="flex-1 bg-stone-700 hover:bg-stone-600"
            >
              {isUploading ? 'Subiendo...' : editingProperty ? 'Actualizar' : 'Publicar'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}