
// Función para calcular la distancia entre dos puntos usando la fórmula de Haversine
export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371; // Radio de la Tierra en kilómetros
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLng / 2) *
    Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distancia en kilómetros
  
  return distance * 1000; // Convertir a metros
};

// Función para obtener las coordenadas de una ubicación conocida
export const getCoordinatesFromLocation = (location: string): { lat: number; lng: number } | null => {
  const locationMap: { [key: string]: [number, number] } = {
    'madrid centro': [40.4168, -3.7038],
    'las rozas, madrid': [40.4926, -3.8739],
    'malasaña, madrid': [40.4264, -3.7037],
    'sol, madrid': [40.4173, -3.7053],
    'salamanca, madrid': [40.4310, -3.6827],
    'pozuelo de alarcón': [40.4364, -3.8123],
    'granada': [37.1773, -3.5986],
    'sevilla': [37.3886, -5.9823],
    'barcelona': [41.3851, 2.1734],
    'valencia': [39.4699, -0.3763],
    'bilbao': [43.2627, -2.9253],
    'málaga': [36.7213, -4.4214],
    'córdoba': [37.8882, -4.7794],
    'toledo': [39.8628, -4.0273],
    // Pueblos de Granada y alrededores
    'almuñécar, granada': [36.7344, -3.6881],
    'motril, granada': [36.7505, -3.5156],
    'guadix, granada': [37.2986, -3.1375],
    'baza, granada': [37.4906, -2.7729],
    'loja, granada': [37.1619, -4.1436],
    'órgiva, granada': [36.8944, -3.4203],
    'monachil, granada': [37.1308, -3.5264]
  };

  const searchKey = location.toLowerCase().trim();
  
  // Buscar coincidencia exacta
  if (locationMap[searchKey]) {
    const coords = locationMap[searchKey];
    return { lat: coords[0], lng: coords[1] };
  }
  
  // Buscar coincidencia parcial
  for (const [key, coords] of Object.entries(locationMap)) {
    if (key.includes(searchKey) || searchKey.includes(key)) {
      return { lat: coords[0], lng: coords[1] };
    }
  }
  
  return null;
};
