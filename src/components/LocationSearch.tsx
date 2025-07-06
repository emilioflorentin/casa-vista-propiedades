
import { useState, useRef, useEffect } from 'react';
import { MapPin, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';

interface LocationSearchProps {
  onLocationSelect: (location: { address: string; lat: number; lng: number; radius: number }) => void;
  placeholder?: string;
}

const LocationSearch = ({ onLocationSelect, placeholder = "¿Dónde buscas?" }: LocationSearchProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [radius, setRadius] = useState("1000");
  const [selectedLocation, setSelectedLocation] = useState<{ address: string; lat: number; lng: number } | null>(null);
  const [showMap, setShowMap] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const circleRef = useRef<google.maps.Circle | null>(null);

  useEffect(() => {
    // Load Google Maps API
    if (!window.google && !document.querySelector('script[src*="maps.googleapis.com"]')) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=places`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }, []);

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;

    const map = new google.maps.Map(mapRef.current, {
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
        const geocoder = new google.maps.Geocoder();
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

    // Initialize autocomplete
    const autocomplete = new google.maps.places.Autocomplete(
      document.getElementById('location-input') as HTMLInputElement,
      { types: ['geocode'] }
    );

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
  };

  const updateMapMarker = (lat: number, lng: number, address: string) => {
    if (!mapInstanceRef.current) return;

    // Remove existing marker and circle
    if (markerRef.current) {
      markerRef.current.setMap(null);
    }
    if (circleRef.current) {
      circleRef.current.setMap(null);
    }

    // Add new marker
    const marker = new google.maps.Marker({
      position: { lat, lng },
      map: mapInstanceRef.current,
      title: address,
    });
    markerRef.current = marker;

    // Add radius circle
    const circle = new google.maps.Circle({
      strokeColor: '#8B5A2B',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#8B5A2B',
      fillOpacity: 0.15,
      map: mapInstanceRef.current,
      center: { lat, lng },
      radius: parseInt(radius),
    });
    circleRef.current = circle;
  };

  const handleShowMap = () => {
    setShowMap(true);
    setTimeout(() => {
      initializeMap();
    }, 100);
  };

  const handleApplyLocation = () => {
    if (selectedLocation) {
      onLocationSelect({
        ...selectedLocation,
        radius: parseInt(radius)
      });
      setShowMap(false);
    }
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          // Reverse geocoding to get address
          if (window.google) {
            const geocoder = new google.maps.Geocoder();
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
          }
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  return (
    <div className="relative">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-3 h-5 w-5 text-stone-400" />
          <Input
            id="location-input"
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 border-0 text-stone-700"
            onClick={handleShowMap}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleCurrentLocation}
          className="h-12 px-3 border-0 bg-stone-100 hover:bg-stone-200"
        >
          <Target className="h-4 w-4" />
        </Button>
      </div>

      {showMap && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-2 shadow-lg">
          <CardContent className="p-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Radio de búsqueda
              </label>
              <Select value={radius} onValueChange={setRadius}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="500">500 metros</SelectItem>
                  <SelectItem value="1000">1 kilómetro</SelectItem>
                  <SelectItem value="2000">2 kilómetros</SelectItem>
                  <SelectItem value="5000">5 kilómetros</SelectItem>
                  <SelectItem value="10000">10 kilómetros</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div 
              ref={mapRef} 
              className="w-full h-64 rounded-lg mb-4"
              style={{ minHeight: '250px' }}
            />
            
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowMap(false)}
                size="sm"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleApplyLocation}
                disabled={!selectedLocation}
                size="sm"
                className="bg-stone-600 hover:bg-stone-700"
              >
                Aplicar Ubicación
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LocationSearch;
