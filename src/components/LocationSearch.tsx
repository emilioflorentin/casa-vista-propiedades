import { useState, useRef, useEffect } from 'react';
import { MapPin, Target, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationSearchProps {
  onLocationSelect: (location: { address: string; lat: number; lng: number; radius: number }) => void;
  placeholder?: string;
}

const LocationSearch = ({ onLocationSelect, placeholder = "¿Dónde buscas?" }: LocationSearchProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [radius, setRadius] = useState("1000");
  const [selectedLocation, setSelectedLocation] = useState<{ address: string; lat: number; lng: number } | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const modalInputRef = useRef<HTMLInputElement>(null);

  // Geocode location using Nominatim API (same as MapComponent)
  const geocodeLocation = async (location: string): Promise<{ lat: number; lng: number; address: string }> => {
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
        const lng = parseFloat(data[0].lon);
        console.log(`Found coordinates for ${location}: [${lat}, ${lng}]`);
        return { lat, lng, address: location };
      } else {
        console.log(`No results found for ${location}, using Granada center as fallback`);
        // Fallback to center of Granada if no results found
        return { lat: 37.1773, lng: -3.5986, address: location };
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      // Fallback to center of Granada on error
      return { lat: 37.1773, lng: -3.5986, address: location };
    }
  };

  const handleTextSearch = async () => {
    if (searchQuery.trim() && !isSearching) {
      console.log('Executing text search for:', searchQuery);
      setIsSearching(true);
      
      try {
        // Use the geocodeLocation function for dynamic geocoding
        const result = await geocodeLocation(searchQuery);
        
        const location = {
          address: result.address,
          lat: result.lat,
          lng: result.lng,
          radius: parseInt(radius)
        };
        
        setSelectedLocation({ address: result.address, lat: result.lat, lng: result.lng });
        onLocationSelect(location);
        console.log('Text search applied:', location);
      } catch (error) {
        console.error('Error in text search:', error);
      } finally {
        // Reset searching state after a brief delay
        setTimeout(() => setIsSearching(false), 500);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    // Reset searching state when user types
    setIsSearching(false);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTextSearch();
    }
  };

  const initializeMap = () => {
    if (!mapRef.current) return;

    const map = L.map(mapRef.current).setView([40.4168, -3.7038], 10);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    mapInstanceRef.current = map;

    // Add click listener to map
    map.on('click', (event: L.LeafletMouseEvent) => {
      const lat = event.latlng.lat;
      const lng = event.latlng.lng;
      
      // Use a simple location name based on coordinates
      const address = `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
      setSelectedLocation({ address, lat, lng });
      setSearchQuery(address);
      updateMapMarker(lat, lng, address);
    });
  };

  const updateMapMarker = (lat: number, lng: number, address: string) => {
    if (!mapInstanceRef.current) return;

    // Remove existing marker and circle
    if (markerRef.current) {
      mapInstanceRef.current.removeLayer(markerRef.current);
    }
    if (circleRef.current) {
      mapInstanceRef.current.removeLayer(circleRef.current);
    }

    // Add new marker
    const marker = L.marker([lat, lng]).addTo(mapInstanceRef.current);
    marker.bindPopup(address).openPopup();
    markerRef.current = marker;

    // Add radius circle
    const circle = L.circle([lat, lng], {
      color: '#8B7355',
      fillColor: '#8B7355',
      fillOpacity: 0.15,
      radius: parseInt(radius)
    }).addTo(mapInstanceRef.current);
    circleRef.current = circle;
  };

  // Update radius circle when radius changes
  useEffect(() => {
    if (selectedLocation && mapInstanceRef.current && circleRef.current) {
      // Remove existing circle
      mapInstanceRef.current.removeLayer(circleRef.current);
      
      // Add new circle with updated radius
      const circle = L.circle([selectedLocation.lat, selectedLocation.lng], {
        color: '#8B7355',
        fillColor: '#8B7355',
        fillOpacity: 0.15,
        radius: parseInt(radius)
      }).addTo(mapInstanceRef.current);
      circleRef.current = circle;
    }
  }, [radius, selectedLocation]);

  const handleShowMap = () => {
    setShowMap(true);
    setIsSearching(false);
    setTimeout(() => {
      initializeMap();
    }, 100);
  };

  const handleCloseMap = () => {
    setShowMap(false);
    // Clean up map
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }
  };

  const handleModalLocationSearch = async () => {
    if (modalInputRef.current && modalInputRef.current.value.trim()) {
      const searchValue = modalInputRef.current.value.trim();
      console.log('Modal search triggered for:', searchValue);
      try {
        const result = await geocodeLocation(searchValue);
        setSelectedLocation(result);
        setSearchQuery(result.address);
        
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([result.lat, result.lng], 14);
          updateMapMarker(result.lat, result.lng, result.address);
        }
      } catch (error) {
        console.error('Error in modal location search:', error);
      }
    }
  };

  const handleModalInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      console.log('Enter key pressed in modal');
      handleModalLocationSearch();
    }
  };

  const handleApplyLocation = () => {
    if (selectedLocation) {
      onLocationSelect({
        ...selectedLocation,
        radius: parseInt(radius)
      });
      handleCloseMap();
      setIsSearching(false);
    }
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const address = `Mi ubicación: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
          
          setSelectedLocation({ address, lat, lng });
          setSearchQuery(address);
          
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([lat, lng], 14);
            updateMapMarker(lat, lng, address);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          // Fallback to text search when geolocation fails
          if (searchQuery.trim()) {
            handleTextSearch();
          }
        }
      );
    } else {
      // Geolocation not supported, use text search
      if (searchQuery.trim()) {
        handleTextSearch();
      }
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }
    };
  }, []);

  return (
    <div className="relative">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-3 h-5 w-5 text-stone-600" />
          <Input
            ref={inputRef}
            placeholder={placeholder}
            value={searchQuery}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            className="pl-10 h-12 border-0 text-stone-700"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleTextSearch}
          disabled={!searchQuery.trim() || isSearching}
          className="h-12 px-3 border-0 bg-stone-100 hover:bg-stone-200 text-stone-700"
          title="Buscar por texto"
        >
          <Search className="h-4 w-4" />
        </Button>
        
        <Dialog open={showMap} onOpenChange={setShowMap}>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleShowMap}
              className="h-12 px-3 border-0 bg-stone-100 hover:bg-stone-200 text-stone-700"
              title="Buscar por ubicación"
            >
              <Target className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[98vw] w-full max-h-[95vh] bg-white overflow-y-auto p-6">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-stone-800">
                Buscar por ubicación
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Buscar dirección
                </label>
                <div className="flex gap-2 w-full">
                  <Input
                    ref={modalInputRef}
                    placeholder="Escribe una dirección (ej: Jaén, Madrid Centro, Sevilla...)"
                    className="flex-1 bg-white border border-gray-300 text-base px-4 py-2"
                    onKeyDown={handleModalInputKeyDown}
                  />
                  <Button
                    onClick={handleModalLocationSearch}
                    size="sm"
                    className="bg-stone-600 hover:bg-stone-700 text-white flex-shrink-0 px-4"
                  >
                    <Search className="h-4 w-4" />
                    <span className="ml-2 hidden sm:inline">Buscar</span>
                  </Button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Radio de búsqueda
                </label>
                <Select value={radius} onValueChange={setRadius}>
                  <SelectTrigger className="w-full bg-white border border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg">
                    <SelectItem value="500">500 metros</SelectItem>
                    <SelectItem value="1000">1 kilómetro</SelectItem>
                    <SelectItem value="2000">2 kilómetros</SelectItem>
                    <SelectItem value="5000">5 kilómetros</SelectItem>
                    <SelectItem value="10000">10 kilómetros</SelectItem>
                    <SelectItem value="50000">10km+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="relative">
                <div 
                  ref={mapRef} 
                  className="w-full h-96 rounded-lg bg-stone-50 border border-gray-200"
                  style={{ minHeight: '384px' }}
                />
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={handleCloseMap}
                  size="sm"
                  className="bg-white hover:bg-stone-50 border-stone-300 text-stone-700"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleCurrentLocation}
                  size="sm"
                  className="bg-stone-600 hover:bg-stone-700 text-white"
                >
                  Mi Ubicación
                </Button>
                <Button
                  onClick={handleApplyLocation}
                  disabled={!selectedLocation}
                  size="sm"
                  className="bg-stone-600 hover:bg-stone-700 text-white disabled:opacity-50"
                >
                  Aplicar Ubicación
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default LocationSearch;
