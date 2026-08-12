import { useEffect, useRef } from 'react';
import { X, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
// Bundled with this component rather than loaded from unpkg in
// index.html — that was a render-blocking third-party request on every
// page load, for a stylesheet only this modal needs.
import 'leaflet/dist/leaflet.css';

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

export default function FarmerLocationMap({ farmerLocation, farmerName, onClose }) {
  const { t } = useTranslation();
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

      // Custom marker in the ledger's maroon, matching the app's identity
      const farmerIcon = L.divIcon({
        className: 'custom-farmer-marker',
        html: `<div style="background: linear-gradient(135deg, #6E1423 0%, #530E19 100%); color: #F1E8D6; padding: 10px 16px; border-radius: 2px; font-weight: 600; font-family: 'IBM Plex Sans', sans-serif; box-shadow: 0 4px 12px rgba(110, 20, 35, 0.4); font-size: 14px; white-space: nowrap; border: 2px solid #F1E8D6;">
          🌾 ${farmerName}
        </div>`,
        iconSize: [140, 50],
        iconAnchor: [70, 50],
      });

      // Add marker with popup
      L.marker([coords.lat, coords.lng], { icon: farmerIcon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family: 'IBM Plex Sans', system-ui, sans-serif; padding: 8px;">
            <strong style="font-size: 16px; color: #6E1423;">${farmerName}</strong><br>
            <span style="color: #241C15; opacity: 0.6; font-size: 14px;">📍 ${farmerLocation}</span>
          </div>
        `)
        .openPopup();

      // Circle in leaf green — the produce/freshness accent, marking the
      // general growing area rather than an exact pin.
      L.circle([coords.lat, coords.lng], {
        color: '#3F6B3F',
        fillColor: '#3F6B3F',
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
    <div className="ledger-scope fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4">
      <div className="w-full max-w-4xl overflow-hidden rounded-sm bg-paper shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 bg-maroon px-6 py-5 text-paper">
          <div>
            <h3 className="font-display text-xl font-semibold sm:text-2xl">
              {t('map.titleFor', { name: farmerName })}
            </h3>
            <p className="mt-1 text-sm text-paper/75">
              {t('map.subtitle')}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label={t('map.close')}
            className="shrink-0 rounded-sm p-2 text-paper/75 transition-colors hover:bg-paper/10 hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-brass-light"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Map Container */}
        <div ref={mapRef} className="h-[420px] w-full bg-paper-dim sm:h-[500px]" />

        {/* Footer Info */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-ink/10 bg-paper-dim px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="rounded-sm bg-leaf/10 p-2.5">
              <MapPin className="h-5 w-5 text-leaf" />
            </div>
            <div>
              <p className="font-ledger text-[11px] font-semibold uppercase tracking-wide text-ink/50">
                {t('common.location')}
              </p>
              <p className="font-display font-semibold">
                {farmerLocation}
              </p>
            </div>
          </div>
          <span className="rounded-sm border border-brass/30 bg-brass/10 px-3 py-1.5 font-ledger text-xs font-semibold uppercase tracking-wide text-brass-dark">
            {t('map.interactiveMap')}
          </span>
        </div>
      </div>
    </div>
  );
}
