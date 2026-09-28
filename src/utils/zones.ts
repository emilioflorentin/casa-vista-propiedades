// Zonas predefinidas para búsqueda por secciones en el mapa.
export interface SearchZone {
  name: string;
  city: string;
  lat: number;
  lng: number;
  radius: number; // metros sugeridos
}

// Barrios / distritos con detalle fino
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
  // Área metropolitana de Granada
  { name: 'Albolote', city: 'Albolote', lat: 37.3052, lng: -3.6615, radius: 2000 },
  { name: 'Armilla', city: 'Armilla', lat: 37.141, lng: -3.6185, radius: 1500 },
  { name: 'Maracena', city: 'Maracena', lat: 37.2076, lng: -3.6349, radius: 1500 },
  // Jaén
  { name: 'Centro', city: 'Jaén', lat: 37.7796, lng: -3.7849, radius: 1000 },
  { name: 'La Alcantarilla', city: 'Jaén', lat: 37.765, lng: -3.795, radius: 1200 },
  { name: 'Bulevar', city: 'Jaén', lat: 37.775, lng: -3.8, radius: 900 },
];

// Capitales de provincia de toda España, agrupadas por comunidad autónoma
export const SPAIN_PROVINCES: { community: string; zones: SearchZone[] }[] = [
  {
    community: 'Andalucía',
    zones: [
      { name: 'Almería', city: 'Almería', lat: 36.834, lng: -2.4637, radius: 8000 },
      { name: 'Cádiz', city: 'Cádiz', lat: 36.5271, lng: -6.2886, radius: 6000 },
      { name: 'Córdoba', city: 'Córdoba', lat: 37.8882, lng: -4.7794, radius: 8000 },
      { name: 'Granada', city: 'Granada', lat: 37.1773, lng: -3.5986, radius: 8000 },
      { name: 'Huelva', city: 'Huelva', lat: 37.2614, lng: -6.9447, radius: 6000 },
      { name: 'Jaén', city: 'Jaén', lat: 37.7796, lng: -3.7849, radius: 8000 },
      { name: 'Málaga', city: 'Málaga', lat: 36.7213, lng: -4.4214, radius: 10000 },
      { name: 'Sevilla', city: 'Sevilla', lat: 37.3891, lng: -5.9845, radius: 10000 },
    ],
  },
  {
    community: 'Aragón',
    zones: [
      { name: 'Huesca', city: 'Huesca', lat: 42.1362, lng: -0.4087, radius: 6000 },
      { name: 'Teruel', city: 'Teruel', lat: 40.3456, lng: -1.1065, radius: 6000 },
      { name: 'Zaragoza', city: 'Zaragoza', lat: 41.6488, lng: -0.8891, radius: 10000 },
    ],
  },
  {
    community: 'Asturias',
    zones: [
      { name: 'Oviedo', city: 'Oviedo', lat: 43.3619, lng: -5.8494, radius: 7000 },
      { name: 'Gijón', city: 'Gijón', lat: 43.5322, lng: -5.6611, radius: 7000 },
    ],
  },
  {
    community: 'Islas Baleares',
    zones: [
      { name: 'Palma de Mallorca', city: 'Palma', lat: 39.5696, lng: 2.6502, radius: 8000 },
      { name: 'Ibiza', city: 'Ibiza', lat: 38.9067, lng: 1.4206, radius: 6000 },
      { name: 'Mahón', city: 'Mahón', lat: 39.8885, lng: 4.2657, radius: 5000 },
    ],
  },
  {
    community: 'Canarias',
    zones: [
      { name: 'Las Palmas', city: 'Las Palmas de Gran Canaria', lat: 28.1235, lng: -15.4363, radius: 8000 },
      { name: 'Santa Cruz de Tenerife', city: 'Santa Cruz de Tenerife', lat: 28.4636, lng: -16.2518, radius: 8000 },
    ],
  },
  {
    community: 'Cantabria',
    zones: [
      { name: 'Santander', city: 'Santander', lat: 43.4623, lng: -3.8099, radius: 7000 },
    ],
  },
  {
    community: 'Castilla-La Mancha',
    zones: [
      { name: 'Albacete', city: 'Albacete', lat: 38.9943, lng: -1.8585, radius: 7000 },
      { name: 'Ciudad Real', city: 'Ciudad Real', lat: 38.9848, lng: -3.9274, radius: 6000 },
      { name: 'Cuenca', city: 'Cuenca', lat: 40.0704, lng: -2.1374, radius: 5000 },
      { name: 'Guadalajara', city: 'Guadalajara', lat: 40.6325, lng: -3.1675, radius: 6000 },
      { name: 'Toledo', city: 'Toledo', lat: 39.8628, lng: -4.0273, radius: 6000 },
    ],
  },
  {
    community: 'Castilla y León',
    zones: [
      { name: 'Ávila', city: 'Ávila', lat: 40.6567, lng: -4.6818, radius: 5000 },
      { name: 'Burgos', city: 'Burgos', lat: 42.3439, lng: -3.6969, radius: 7000 },
      { name: 'León', city: 'León', lat: 42.5987, lng: -5.5671, radius: 7000 },
      { name: 'Palencia', city: 'Palencia', lat: 42.0096, lng: -4.5288, radius: 5000 },
      { name: 'Salamanca', city: 'Salamanca', lat: 40.9701, lng: -5.6635, radius: 6000 },
      { name: 'Segovia', city: 'Segovia', lat: 40.9429, lng: -4.1088, radius: 5000 },
      { name: 'Soria', city: 'Soria', lat: 41.7636, lng: -2.4649, radius: 5000 },
      { name: 'Valladolid', city: 'Valladolid', lat: 41.6523, lng: -4.7245, radius: 8000 },
      { name: 'Zamora', city: 'Zamora', lat: 41.5035, lng: -5.7438, radius: 5000 },
    ],
  },
  {
    community: 'Cataluña',
    zones: [
      { name: 'Barcelona', city: 'Barcelona', lat: 41.3874, lng: 2.1686, radius: 10000 },
      { name: 'Girona', city: 'Girona', lat: 41.9794, lng: 2.8214, radius: 6000 },
      { name: 'Lleida', city: 'Lleida', lat: 41.6176, lng: 0.62, radius: 6000 },
      { name: 'Tarragona', city: 'Tarragona', lat: 41.1189, lng: 1.2445, radius: 6000 },
    ],
  },
  {
    community: 'Comunidad Valenciana',
    zones: [
      { name: 'Alicante', city: 'Alicante', lat: 38.3452, lng: -0.481, radius: 8000 },
      { name: 'Castellón', city: 'Castellón de la Plana', lat: 39.9864, lng: -0.0513, radius: 7000 },
      { name: 'Valencia', city: 'Valencia', lat: 39.4699, lng: -0.3763, radius: 10000 },
    ],
  },
  {
    community: 'Extremadura',
    zones: [
      { name: 'Badajoz', city: 'Badajoz', lat: 38.8794, lng: -6.9707, radius: 7000 },
      { name: 'Cáceres', city: 'Cáceres', lat: 39.4753, lng: -6.3724, radius: 6000 },
    ],
  },
  {
    community: 'Galicia',
    zones: [
      { name: 'A Coruña', city: 'A Coruña', lat: 43.3623, lng: -8.4115, radius: 7000 },
      { name: 'Lugo', city: 'Lugo', lat: 43.0097, lng: -7.5568, radius: 5000 },
      { name: 'Ourense', city: 'Ourense', lat: 42.336, lng: -7.8641, radius: 6000 },
      { name: 'Pontevedra', city: 'Pontevedra', lat: 42.431, lng: -8.6444, radius: 6000 },
      { name: 'Santiago de Compostela', city: 'Santiago de Compostela', lat: 42.8782, lng: -8.5448, radius: 6000 },
      { name: 'Vigo', city: 'Vigo', lat: 42.2406, lng: -8.7207, radius: 7000 },
    ],
  },
  {
    community: 'La Rioja',
    zones: [
      { name: 'Logroño', city: 'Logroño', lat: 42.4627, lng: -2.445, radius: 6000 },
    ],
  },
  {
    community: 'Madrid',
    zones: [
      { name: 'Madrid', city: 'Madrid', lat: 40.4168, lng: -3.7038, radius: 10000 },
      { name: 'Alcalá de Henares', city: 'Alcalá de Henares', lat: 40.4818, lng: -3.3635, radius: 6000 },
      { name: 'Getafe', city: 'Getafe', lat: 40.3083, lng: -3.7324, radius: 6000 },
      { name: 'Móstoles', city: 'Móstoles', lat: 40.3223, lng: -3.8649, radius: 6000 },
    ],
  },
  {
    community: 'Murcia',
    zones: [
      { name: 'Murcia', city: 'Murcia', lat: 37.9922, lng: -1.1307, radius: 8000 },
      { name: 'Cartagena', city: 'Cartagena', lat: 37.6057, lng: -0.9862, radius: 7000 },
    ],
  },
  {
    community: 'Navarra',
    zones: [
      { name: 'Pamplona', city: 'Pamplona', lat: 42.8125, lng: -1.6458, radius: 7000 },
    ],
  },
  {
    community: 'País Vasco',
    zones: [
      { name: 'Bilbao', city: 'Bilbao', lat: 43.263, lng: -2.935, radius: 8000 },
      { name: 'San Sebastián', city: 'San Sebastián', lat: 43.3183, lng: -1.9812, radius: 7000 },
      { name: 'Vitoria-Gasteiz', city: 'Vitoria-Gasteiz', lat: 42.8467, lng: -2.6716, radius: 7000 },
    ],
  },
  {
    community: 'Ceuta y Melilla',
    zones: [
      { name: 'Ceuta', city: 'Ceuta', lat: 35.8894, lng: -5.3213, radius: 4000 },
      { name: 'Melilla', city: 'Melilla', lat: 35.2923, lng: -2.9381, radius: 4000 },
    ],
  },
];
