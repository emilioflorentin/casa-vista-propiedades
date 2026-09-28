// Zonas predefinidas (barrios / distritos) para búsqueda por secciones en el mapa.
export interface SearchZone {
  name: string;
  city: string;
  lat: number;
  lng: number;
  radius: number; // metros sugeridos
}

export const SEARCH_ZONES: SearchZone[] = [
  // Granada
  { name: 'Centro', city: 'Granada', lat: 37.1765, lng: -3.5986, radius: 1000 },
  { name: 'Albaicín', city: 'Granada', lat: 37.181, lng: -3.593, radius: 800 },
  { name: 'Realejo', city: 'Granada', lat: 37.172, lng: -3.597, radius: 800 },
  { name: 'Zaidín', city: 'Granada', lat: 37.156, lng: -3.598, radius: 1200 },
  { name: 'Beiro', city: 'Granada', lat: 37.189, lng: -3.603, radius: 1000 },
  { name: 'Genil', city: 'Granada', lat: 37.165, lng: -3.615, radius: 1200 },
  { name: 'Ronda', city: 'Granada', lat: 37.173, lng: -3.607, radius: 900 },
  { name: 'Chana', city: 'Granada', lat: 37.19, lng: -3.617, radius: 1000 },
  { name: 'Norte - Cartuja', city: 'Granada', lat: 37.196, lng: -3.596, radius: 1000 },
  // Área metropolitana
  { name: 'Albolote', city: 'Albolote', lat: 37.3052, lng: -3.6615, radius: 2000 },
  { name: 'Armilla', city: 'Armilla', lat: 37.141, lng: -3.6185, radius: 1500 },
  { name: 'Maracena', city: 'Maracena', lat: 37.2076, lng: -3.6349, radius: 1500 },
  // Jaén
  { name: 'Centro', city: 'Jaén', lat: 37.7796, lng: -3.7849, radius: 1000 },
  { name: 'La Alcantarilla', city: 'Jaén', lat: 37.765, lng: -3.795, radius: 1200 },
  { name: 'Bulevar', city: 'Jaén', lat: 37.775, lng: -3.8, radius: 900 },
];
