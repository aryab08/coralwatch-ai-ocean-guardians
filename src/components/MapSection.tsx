import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from '@/components/ui/button';
import { MapPin, Info } from 'lucide-react';

// Coral reef locations around the world
const coralReefs = [
  {
    name: "Great Barrier Reef",
    coordinates: [145.7781, -16.2839],
    country: "Australia",
    status: "Vulnerable",
    description: "The world's largest coral reef system"
  },
  {
    name: "Mesoamerican Reef",
    coordinates: [-87.5, 18.0],
    country: "Caribbean",
    status: "Threatened",
    description: "Second largest barrier reef in the world"
  },
  {
    name: "Coral Triangle",
    coordinates: [120.0, -2.0],
    country: "Southeast Asia",
    status: "Critical",
    description: "Marine biodiversity hotspot"
  },
  {
    name: "Red Sea Coral Reef",
    coordinates: [38.0, 20.0],
    country: "Red Sea",
    status: "Stable",
    description: "Remarkably resilient coral ecosystem"
  },
  {
    name: "New Caledonia Barrier Reef",
    coordinates: [165.0, -21.0],
    country: "New Caledonia",
    status: "Protected",
    description: "UNESCO World Heritage site"
  },
  {
    name: "Florida Keys Reef",
    coordinates: [-80.5, 24.7],
    country: "USA",
    status: "Recovering",
    description: "Third largest barrier reef system"
  }
];

const MapSection = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [selectedReef, setSelectedReef] = useState<typeof coralReefs[0] | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(true);

  const initializeMap = (token: string) => {
    if (!mapContainer.current || !token) return;

    mapboxgl.accessToken = token;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      projection: 'globe',
      zoom: 2,
      center: [30, 15],
      pitch: 0,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    // Add atmosphere and fog effects
    map.current.on('style.load', () => {
      map.current?.setFog({
        color: 'rgb(186, 210, 235)',
        'high-color': 'rgb(36, 92, 223)',
        'horizon-blend': 0.02,
        'space-color': 'rgb(11, 11, 25)',
        'star-intensity': 0.6,
      });

      // Add coral reef markers
      coralReefs.forEach((reef, index) => {
        // Create custom marker element
        const markerEl = document.createElement('div');
        markerEl.className = 'coral-reef-marker';
        markerEl.innerHTML = `
          <div class="w-6 h-6 bg-coral rounded-full border-2 border-white shadow-lg flex items-center justify-center cursor-pointer transform hover:scale-110 transition-all duration-300">
            <div class="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          </div>
        `;

        // Add marker to map
        const marker = new mapboxgl.Marker(markerEl)
          .setLngLat(reef.coordinates as [number, number])
          .addTo(map.current!);

        // Add click event to marker
        markerEl.addEventListener('click', () => {
          setSelectedReef(reef);
          map.current?.flyTo({
            center: reef.coordinates as [number, number],
            zoom: 8,
            duration: 2000
          });
        });

        // Create popup
        const popup = new mapboxgl.Popup({
          offset: 25,
          className: 'coral-popup'
        }).setHTML(`
          <div class="p-3">
            <h3 class="font-bold text-primary mb-1">${reef.name}</h3>
            <p class="text-sm text-muted-foreground mb-2">${reef.country}</p>
            <p class="text-xs">${reef.description}</p>
            <div class="mt-2">
              <span class="inline-block px-2 py-1 text-xs rounded-full ${
                reef.status === 'Critical' ? 'bg-red-100 text-red-800' :
                reef.status === 'Threatened' ? 'bg-orange-100 text-orange-800' :
                reef.status === 'Vulnerable' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }">
                ${reef.status}
              </span>
            </div>
          </div>
        `);

        marker.setPopup(popup);
      });
    });

    setShowTokenInput(false);
  };

  const handleTokenSubmit = () => {
    if (mapboxToken.trim()) {
      initializeMap(mapboxToken.trim());
    }
  };

  return (
    <section id="map" className="py-20 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Global Coral Reef Map
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Explore coral reef locations worldwide and monitor their conservation status through our interactive map.
          </p>
        </div>

        {showTokenInput && (
          <div className="glass-ocean p-6 rounded-xl mb-8 max-w-2xl mx-auto">
            <div className="flex items-center gap-2 mb-4">
              <Info size={20} className="text-accent" />
              <h3 className="text-lg font-semibold text-white">Mapbox Token Required</h3>
            </div>
            <p className="text-white/90 mb-4 text-sm">
              To view the interactive map, please enter your Mapbox public token. 
              Get yours at <a href="https://mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">mapbox.com</a>
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter your Mapbox public token..."
                value={mapboxToken}
                onChange={(e) => setMapboxToken(e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <Button variant="coral" onClick={handleTokenSubmit}>
                Load Map
              </Button>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Map */}
          <div className="lg:col-span-3">
            <div className="relative h-[600px] rounded-xl overflow-hidden shadow-2xl">
              <div ref={mapContainer} className="absolute inset-0" />
              {showTokenInput && (
                <div className="absolute inset-0 glass-ocean flex items-center justify-center">
                  <div className="text-center text-white">
                    <MapPin size={48} className="mx-auto mb-4 text-accent" />
                    <h3 className="text-xl font-semibold mb-2">Interactive Map</h3>
                    <p className="text-white/80">Enter your Mapbox token to explore coral reefs</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Reef Information Panel */}
          <div className="lg:col-span-1">
            <div className="glass-ocean p-6 rounded-xl h-[600px] overflow-y-auto">
              <h3 className="text-xl font-semibold text-white mb-4">Coral Reef Locations</h3>
              
              {selectedReef ? (
                <div className="text-white">
                  <h4 className="text-lg font-bold text-accent mb-2">{selectedReef.name}</h4>
                  <p className="text-sm text-white/80 mb-2">{selectedReef.country}</p>
                  <p className="text-sm mb-4">{selectedReef.description}</p>
                  <div className="mb-4">
                    <span className={`inline-block px-3 py-1 text-sm rounded-full ${
                      selectedReef.status === 'Critical' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                      selectedReef.status === 'Threatened' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' :
                      selectedReef.status === 'Vulnerable' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                      'bg-green-500/20 text-green-300 border border-green-500/30'
                    }`}>
                      Status: {selectedReef.status}
                    </span>
                  </div>
                  <Button variant="outline" size="sm" className="w-full bg-white/10 border-white/30 text-white hover:bg-white/20">
                    Learn More
                  </Button>
                </div>
              ) : (
                <div className="text-white/80">
                  <p className="text-sm mb-4">Click on any coral reef marker to view detailed information about that location.</p>
                  <div className="space-y-2">
                    {coralReefs.map((reef, index) => (
                      <div key={index} className="text-sm p-2 bg-white/10 rounded border border-white/20">
                        <div className="font-medium text-white">{reef.name}</div>
                        <div className="text-xs text-white/70">{reef.country}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MapSection;