import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

// Location data for different cities (latitude, longitude)
const CITY_COORDINATES = {
  'Karnataka': { lat: 15.3173, lng: 75.7139 },
  'Lucknow': { lat: 26.8467, lng: 80.9462 },
  'Delhi': { lat: 28.7041, lng: 77.1025 },
  'Mumbai': { lat: 19.0760, lng: 72.8777 },
  'Bangalore': { lat: 12.9716, lng: 77.5946 },
  'Chennai': { lat: 13.0827, lng: 80.2707 },
  'Kolkata': { lat: 22.5726, lng: 88.3639 },
  'Hyderabad': { lat: 17.3850, lng: 78.4867 },
  'Pune': { lat: 18.5204, lng: 73.8567 },
  'Ahmedabad': { lat: 23.0225, lng: 72.5714 },
};

export default function FarmerLocationMap({ farmerLocation, farmerName, onClose, isDark }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Get coordinates for the farmer's location
    const coords = CITY_COORDINATES[farmerLocation] || CITY_COORDINATES['Karnataka'];

    // Dynamically import Leaflet (to avoid SSR issues)
    import('leaflet').then((L) => {
      // Initialize map
      const map = L.map(mapRef.current).setView([coords.lat, coords.lng], 12);
      mapInstanceRef.current = map;

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map);

      // Create custom marker icon
      const farmerIcon = L.divIcon({
        className: 'custom-farmer-marker',
        html: `<div style="background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%); color: white; padding: 10px 16px; border-radius: 24px; font-weight: 700; box-shadow: 0 4px 12px rgba(20, 184, 166, 0.4); font-size: 14px; white-space: nowrap; border: 2px solid white;">
          🌾 ${farmerName}
        </div>`,
        iconSize: [140, 50],
        iconAnchor: [70, 50],
      });

      // Add marker with popup
      L.marker([coords.lat, coords.lng], { icon: farmerIcon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family: system-ui, -apple-system, sans-serif; padding: 8px;">
            <strong style="font-size: 16px; color: #0f766e;">${farmerName}</strong><br>
            <span style="color: #64748b; font-size: 14px;">📍 ${farmerLocation}</span>
          </div>
        `)
        .openPopup();

      // Add circle to show general area
      L.circle([coords.lat, coords.lng], {
        color: '#14b8a6',
        fillColor: '#14b8a6',
        fillOpacity: 0.1,
        radius: 2000, // 2km radius
      }).addTo(map);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [farmerLocation, farmerName]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className={`rounded-3xl w-full max-w-4xl max-h-[85vh] overflow-hidden shadow-2xl transform transition-all animate-slideUp ${
        isDark ? 'bg-slate-800' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`flex justify-between items-center p-6 border-b ${
          isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-gradient-to-r from-teal-50 to-emerald-50'
        }`}>
          <div>
            <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              📍 {farmerName}'s Location
            </h3>
            <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              View farmer's field location on the map
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-3 rounded-full transition-all hover:rotate-90 ${
              isDark 
                ? 'text-slate-400 hover:text-white hover:bg-slate-700' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
            }`}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Map Container */}
        <div ref={mapRef} className="w-full h-[500px] bg-slate-100" />

        {/* Footer Info */}
        <div className={`p-6 flex items-center justify-between ${
          isDark ? 'bg-slate-900/50 border-t border-slate-700' : 'bg-gradient-to-r from-teal-50 to-emerald-50 border-t border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-full ${isDark ? 'bg-teal-900/30' : 'bg-teal-100'}`}>
              <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                Location
              </p>
              <p className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {farmerLocation}
              </p>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
            isDark ? 'bg-teal-900/30 text-teal-400' : 'bg-teal-100 text-teal-700'
          }`}>
            🗺️ Interactive Map
          </div>
        </div>
      </div>
    </div>
  );
}
