
import React, { useEffect, useRef, useState } from 'react';
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Geocode location using Nominatim API
  const geocodeLocation = async (location: string): Promise<[number, number]> => {
    try {
      console.log(`Geocoding location: ${location}`);
      
      // Clean up the location string for better search results
      const cleanLocation = location.replace(/,\s*/g, ', ').trim();
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cleanLocation)}&limit=1&countrycodes=es`
      );
      
      if (!response.ok) {
        throw new Error('Geocoding service unavailable');
      }
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        console.log(`Found coordinates for ${location}: [${lat}, ${lon}]`);
        return [lat, lon];
      } else {
        console.log(`No results found for ${location}, using Spain center as fallback`);
        // Fallback to center of Spain if no results found
        return [40.4637, -3.7492];
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      // Fallback to center of Spain on error
      return [40.4637, -3.7492];
    }
  };

  useEffect(() => {
    if (!mapRef.current) return;

    const initializeMap = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Get coordinates for the location
        const coordinates = await geocodeLocation(location);

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

        setIsLoading(false);
      } catch (error) {
        console.error('Map initialization error:', error);
        setError('Error loading map location');
        setIsLoading(false);
      }
    };

    initializeMap();

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [location, title]);

  if (error) {
    return (
      <div className="w-full h-80 rounded-lg border border-stone-200 flex items-center justify-center bg-stone-50">
        <div className="text-center text-stone-600">
          <p className="text-sm">Error al cargar el mapa</p>
          <p className="text-xs text-stone-500 mt-1">{location}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-80 rounded-lg border border-stone-200" style={{ minHeight: '320px' }}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-stone-50 rounded-lg z-10">
          <div className="text-center text-stone-600">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-600 mx-auto mb-2"></div>
            <p className="text-sm">Cargando ubicación...</p>
            <p className="text-xs text-stone-500 mt-1">{location}</p>
          </div>
        </div>
      )}
      <div 
        ref={mapRef} 
        className="w-full h-full rounded-lg"
      />
    </div>
  );
};

export default MapComponent;
