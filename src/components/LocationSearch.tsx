
import { useState, useRef, useEffect } from 'react';
import { MapPin, Target, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface LocationSearchProps {
  onLocationSelect: (location: { address: string; lat: number; lng: number; radius: number }) => void;
  placeholder?: string;
}

declare global {
  interface Window {
    google: typeof google;
  }
}

const LocationSearch = ({ onLocationSelect, placeholder = "¿Dónde buscas?" }: LocationSearchProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [radius, setRadius] = useState("1000");
  const [selectedLocation, setSelectedLocation] = useState<{ address: string; lat: number; lng: number } | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const circleRef = useRef<google.maps.Circle | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load Google Maps API
    if (!window.google && !document.querySelector('script[src*="maps.googleapis.com"]')) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setMapsLoaded(true);
      };
      document.head.appendChild(script);
    } else if (window.google) {
      setMapsLoaded(true);
    }
  }, []);

  const cleanupAutocomplete = () => {
    if (autocompleteRef.current) {
      // Clear all listeners from autocomplete
      window.google?.maps?.event?.clearInstanceListeners(autocompleteRef.current);
      autocompleteRef.current = null;
    }
  };

  const handleTextSearch = () => {
    if (searchQuery.trim() && !isSearching) {
      console.log('Executing text search for:', searchQuery);
      setIsSearching(true);
      
      // Clean up any existing autocomplete to prevent interference
      cleanupAutocomplete();
      
      // Use text search as fallback when geolocation or maps don't work
      const location = {
        address: searchQuery,
        lat: 40.4168, // Default to Madrid center as fallback
        lng: -3.7038,
        radius: parseInt(radius)
      };
      
      setSelectedLocation({ address: searchQuery, lat: 40.4168, lng: -3.7038 });
      onLocationSelect(location);
      console.log('Text search applied:', location);
      
      // Reset searching state after a brief delay
      setTimeout(() => setIsSearching(false), 500);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    // Reset searching state when user types
    setIsSearching(false);
  };

  const handleInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTextSearch();
    }
  };

  const handleInputFocus = () => {
    // Clean up autocomplete when focusing on main input for text search
    cleanupAutocomplete();
  };

  const initializeMap = () => {
    if (!mapRef.current || !window.google || !mapsLoaded) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: 40.4168, lng: -3.7038 }, // Madrid center
      zoom: 10,
    });

    mapInstanceRef.current = map;

    // Add click listener to map
    map.addListener('click', (event: google.maps.MapMouseEvent) => {
      if (event.latLng) {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        
        // Reverse geocoding to get address
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            const address = results[0].formatted_address;
            setSelectedLocation({ address, lat, lng });
            setSearchQuery(address);
            updateMapMarker(lat, lng, address);
          }
        });
      }
    });

    // Initialize autocomplete only for the modal input
    const modalInputElement = document.getElementById('modal-location-input') as HTMLInputElement;
    if (modalInputElement && !autocompleteRef.current) {
      const autocomplete = new window.google.maps.places.Autocomplete(
        modalInputElement,
        { types: ['geocode'] }
      );
      
      autocompleteRef.current = autocomplete;

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.geometry && place.geometry.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          const address = place.formatted_address || place.name || '';
          
          setSelectedLocation({ address, lat, lng });
          setSearchQuery(address);
          updateMapMarker(lat, lng, address);
          
          map.setCenter({ lat, lng });
          map.setZoom(14);
        }
      });
    }
  };

  const updateMapMarker = (lat: number, lng: number, address: string) => {
    if (!mapInstanceRef.current || !window.google) return;

    // Remove existing marker and circle
    if (markerRef.current) {
      markerRef.current.setMap(null);
    }
    if (circleRef.current) {
      circleRef.current.setMap(null);
    }

    // Add new marker
    const marker = new window.google.maps.Marker({
      position: { lat, lng },
      map: mapInstanceRef.current,
      title: address,
    });
    markerRef.current = marker;

    // Add radius circle
    const circle = new window.google.maps.Circle({
      strokeColor: '#8B7355',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#8B7355',
      fillOpacity: 0.15,
      map: mapInstanceRef.current,
      center: { lat, lng },
      radius: parseInt(radius),
    });
    circleRef.current = circle;
  };

  const handleShowMap = () => {
    setShowMap(true);
    setIsSearching(false);
    setTimeout(() => {
      if (mapsLoaded) {
        initializeMap();
      }
    }, 100);
  };

  const handleCloseMap = () => {
    setShowMap(false);
    // Clean up autocomplete when closing modal
    cleanupAutocomplete();
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
          
          // Reverse geocoding to get address
          if (window.google && mapsLoaded) {
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ location: { lat, lng } }, (results, status) => {
              if (status === 'OK' && results && results[0]) {
                const address = results[0].formatted_address;
                setSelectedLocation({ address, lat, lng });
                setSearchQuery(address);
                
                if (mapInstanceRef.current) {
                  mapInstanceRef.current.setCenter({ lat, lng });
                  mapInstanceRef.current.setZoom(14);
                  updateMapMarker(lat, lng, address);
                }
              }
            });
          } else {
            // Fallback when Google Maps is not available
            const address = `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
            setSelectedLocation({ address, lat, lng });
            setSearchQuery(address);
            onLocationSelect({
              address,
              lat,
              lng,
              radius: parseInt(radius)
            });
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
      cleanupAutocomplete();
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
            onKeyPress={handleInputKeyPress}
            onFocus={handleInputFocus}
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
        
        <Dialog open={showMap} onOpenChange={handleCloseMap}>
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
          <DialogContent className="max-w-2xl w-full bg-white">
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
                <Input
                  id="modal-location-input"
                  placeholder="Escribe una dirección..."
                  className="w-full bg-white border border-gray-300"
                />
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
                  </SelectContent>
                </Select>
              </div>
              
              <div className="relative">
                <div 
                  ref={mapRef} 
                  className="w-full h-80 rounded-lg bg-stone-50 border border-gray-200"
                  style={{ minHeight: '320px' }}
                />
                
                {!mapsLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-stone-50 rounded-lg">
                    <p className="text-stone-600">Cargando mapa...</p>
                  </div>
                )}
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
