import React, { useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';

declare global {
  interface Window {
    google: typeof google;
  }
}

interface CoralReef {
  name: string;
  coordinates: [number, number];
  country: string;
  status: string;
  description: string;
}

interface MapContainerProps {
  coralReefs: CoralReef[];
  onReefSelect: (reef: CoralReef) => void;
  selectedReef: CoralReef | null;
}

const MapContainer: React.FC<MapContainerProps> = ({ coralReefs, onReefSelect, selectedReef }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  useEffect(() => {
    const initializeMap = () => {
      if (!mapRef.current || !window.google) return;
      
      console.log('Initializing Google Maps...');
      
      try {
        // Create the map with standard API
        googleMapRef.current = new window.google.maps.Map(mapRef.current, {
          zoom: 3,
          center: { lat: 15, lng: 30 },
          mapTypeId: 'satellite',
          gestureHandling: 'greedy',
          zoomControl: true,
          streetViewControl: false,
          fullscreenControl: true,
          mapTypeControl: true,
        });

        console.log('Google Maps initialized successfully');

        // Clear existing markers
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];

        // Add coral reef markers
        console.log('Adding', coralReefs.length, 'coral reef markers...');
        
        coralReefs.forEach((reef) => {
          console.log('Creating marker for:', reef.name);
          
          const marker = new window.google.maps.Marker({
            map: googleMapRef.current,
            position: { lat: reef.coordinates[1], lng: reef.coordinates[0] },
            title: reef.name,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: '#f97316',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 3,
            },
            animation: window.google.maps.Animation.DROP,
          });

          // Add click event
          marker.addListener('click', () => {
            console.log('Marker clicked:', reef.name);
            onReefSelect(reef);
            googleMapRef.current?.panTo({ lat: reef.coordinates[1], lng: reef.coordinates[0] });
            googleMapRef.current?.setZoom(8);
          });

          markersRef.current.push(marker);
          console.log('Added marker for:', reef.name);
        });

        console.log('All markers added successfully');
        
      } catch (error) {
        console.error('Error initializing Google Maps:', error);
      }
    };

    // Load Google Maps API if not already loaded
    if (typeof window.google === 'undefined' || !window.google.maps) {
      console.log('Loading Google Maps API...');
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dO9uONWm2pY_hQ&callback=Function.prototype`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log('Google Maps script loaded');
        setTimeout(initializeMap, 100);
      };
      script.onerror = (error) => {
        console.error('Failed to load Google Maps API:', error);
      };
      document.head.appendChild(script);
    } else {
      console.log('Google Maps already loaded, initializing...');
      initializeMap();
    }

    return () => {
      // Cleanup markers
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
    };
  }, [coralReefs, onReefSelect]);

  // Update marker appearance when reef is selected
  useEffect(() => {
    if (selectedReef) {
      const selectedMarker = markersRef.current.find((marker, index) => 
        coralReefs[index].name === selectedReef.name
      );
      
      if (selectedMarker) {
        googleMapRef.current?.panTo({ lat: selectedReef.coordinates[1], lng: selectedReef.coordinates[0] });
        googleMapRef.current?.setZoom(8);
      }
    }
  }, [selectedReef, coralReefs]);

  return (
    <div className="relative h-[600px] rounded-xl overflow-hidden shadow-2xl bg-muted">
      <div 
        ref={mapRef} 
        className="absolute inset-0 w-full h-full" 
        style={{ minHeight: '600px' }}
      />
      {!googleMapRef.current && (
        <div className="absolute inset-0 glass-ocean flex items-center justify-center">
          <div className="text-center text-white">
            <MapPin size={48} className="mx-auto mb-4 text-accent animate-pulse" />
            <h3 className="text-xl font-semibold mb-2">Loading Interactive Map</h3>
            <p className="text-white/80">Please wait while we load the coral reef locations...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapContainer;