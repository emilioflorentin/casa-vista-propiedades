// Tipos de inmueble disponibles en el portal (estilo Idealista)
export const PROPERTY_TYPE_LABELS: Record<string, string> = {
  apartment: 'Piso',
  house: 'Casa',
  loft: 'Loft',
  studio: 'Estudio',
  room: 'Habitación',
  vacation: 'Vacacional',
  garage: 'Garaje',
  storage: 'Trastero',
  office: 'Oficina',
  commercial: 'Local o nave',
  transfer: 'Traspaso',
  land: 'Terreno',
  building: 'Edificio',
  new_development: 'Obra nueva',
};

export const getPropertyTypeLabel = (type: string): string =>
  PROPERTY_TYPE_LABELS[type] || type;
