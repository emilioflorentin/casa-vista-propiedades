import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapComponentProps {
  location: string;
  title: string;
}

const MapComponent: React.FC<MapComponentProps> = ({ location, title }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Geocode the location with expanded coordinates
    const getCoordinates = (location: string) => {
      const locationMap: { [key: string]: [number, number] } = {
        // Madrid locations
        'Madrid Centro': [40.4168, -3.7038],
        'Las Rozas, Madrid': [40.4926, -3.8739],
        'Malasaña, Madrid': [40.4264, -3.7037],
        'Sol, Madrid': [40.4173, -3.7053],
        'Salamanca, Madrid': [40.4310, -3.6827],
        'Pozuelo de Alarcón': [40.4364, -3.8123],
        
        // Granada locations
        'Granada': [37.1773, -3.5986],
        'Almuñécar, Granada': [36.7344, -3.6881],
        'Motril, Granada': [36.7498, -3.5151],
        'Guadix, Granada': [37.3048, -3.1387],
        'Baza, Granada': [37.4909, -2.7729],
        'Loja, Granada': [37.1616, -4.1411],
        'Órgiva, Granada': [36.8439, -3.4205],
        'Monachil, Granada': [37.1328, -3.5164],
        
        // Other cities
        'Sevilla': [37.3886, -5.9823],
        'Barcelona': [41.3851, 2.1734],
        'Valencia': [39.4699, -0.3763]
      };
      
      return locationMap[location] || [37.1773, -3.5986]; // Default to Granada center if location not found
    };

    const coordinates = getCoordinates(location);

    // Initialize the map
    mapInstanceRef.current = L.map(mapRef.current).setView(coordinates, 15);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapInstanceRef.current);

    // Add a marker
    L.marker(coordinates)
      .addTo(mapInstanceRef.current)
      .bindPopup(`<strong>${title}</strong><br/>${location}`)
      .openPopup();

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [location, title]);

  return (
    <div 
      ref={mapRef} 
      className="w-full h-80 rounded-lg border border-stone-200"
      style={{ minHeight: '320px' }}
    />
  );
};

export default MapComponent;
