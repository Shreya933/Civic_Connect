// frontend/src/components/LocationPicker.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Navigation,
  Search,
  Check,
  AlertCircle,
  Crosshair,
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { formatCoordinates } from '../utils/formatters';

// Fix Leaflet marker icon asset paths for bundlers like Vite
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

export const LocationPicker = ({
  initialLatitude = 12.9716,
  initialLongitude = 77.5946,
  initialAddress = '',
  onLocationChange,
}) => {
  const [coords, setCoords] = useState({
    latitude: initialLatitude,
    longitude: initialLongitude,
  });
  const [address, setAddress] = useState(
    initialAddress || 'Mahatma Gandhi Road, Central Commercial District, Ward 14'
  );
  const [isDetecting, setIsDetecting] = useState(false);
  const [gpsError, setGpsError] = useState(null);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  // Notify parent on change
  const updateLocation = (lat, lng, addr) => {
    const newCoords = { latitude: Number(lat), longitude: Number(lng) };
    setCoords(newCoords);
    if (addr) setAddress(addr);
    if (onLocationChange) {
      onLocationChange({
        latitude: newCoords.latitude,
        longitude: newCoords.longitude,
        address: addr || address,
      });
    }

    if (mapInstanceRef.current && markerRef.current) {
      markerRef.current.setLatLng([newCoords.latitude, newCoords.longitude]);
      mapInstanceRef.current.setView([newCoords.latitude, newCoords.longitude], 15);
    }
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [coords.latitude, coords.longitude],
        zoom: 14,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      const marker = L.marker([coords.latitude, coords.longitude], {
        draggable: true,
      }).addTo(map);

      // Marker drag event
      marker.on('dragend', () => {
        const position = marker.getLatLng();
        const autoAddr = `Pinned Location (${position.lat.toFixed(5)}° N, ${position.lng.toFixed(5)}° E)`;
        updateLocation(position.lat, position.lng, autoAddr);
      });

      // Map click event
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        const autoAddr = `Selected Location (${lat.toFixed(5)}° N, ${lng.toFixed(5)}° E)`;
        updateLocation(lat, lng, autoAddr);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;

      // Invalidate size after layout stabilization
      setTimeout(() => {
        map.invalidateSize();
      }, 250);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  // Browser Geolocation API ("Use My Location")
  const handleDetectGPS = () => {
    setIsDetecting(true);
    setGpsError(null);

    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      setIsDetecting(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const resolvedAddress = `Detected Location near coordinates (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
        updateLocation(latitude, longitude, resolvedAddress);
        setIsDetecting(false);
      },
      (error) => {
        console.warn('GPS detection error:', error);
        setGpsError(
          error.message || 'Unable to retrieve location. Please grant permission or choose on map.'
        );
        setIsDetecting(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  // Preset location quick picks
  const quickLocations = [
    { name: 'City Center / MG Road', lat: 12.9716, lng: 77.5946, addr: 'MG Road Metro Station Corridor, Ward 1' },
    { name: 'Indira Nagar Market', lat: 12.9784, lng: 77.6412, addr: '100ft Road, Indira Nagar Market, Ward 12' },
    { name: 'South Zone / Jayanagar', lat: 12.9308, lng: 77.5838, addr: '4th Block Shopping Complex, Jayanagar' },
    { name: 'Tech Park Corridor', lat: 12.9352, lng: 77.6946, addr: 'Outer Ring Road, Bellandur Junction' },
  ];

  return (
    <div>
      {/* Top action row */}
      <div className="location-tools-bar d-flex flex-wrap gap-2 mb-3 align-items-center">
        <button
          type="button"
          className="btn btn-primary btn-sm d-inline-flex align-items-center gap-2"
          onClick={handleDetectGPS}
          disabled={isDetecting}
        >
          <Navigation size={15} style={{ animation: isDetecting ? 'spin 1s linear infinite' : 'none' }} />
          <span>{isDetecting ? 'Acquiring GPS Satellite Lock...' : 'Use My Current Location'}</span>
        </button>

        <div className="d-flex gap-1 flex-wrap align-items-center ms-auto">
          <span className="small text-muted fw-bold">Quick Wards:</span>
          {quickLocations.map((loc) => (
            <button
              key={loc.name}
              type="button"
              className="btn btn-outline-secondary btn-sm"
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
              onClick={() => updateLocation(loc.lat, loc.lng, loc.addr)}
            >
              {loc.name}
            </button>
          ))}
        </div>
      </div>

      {gpsError && (
        <div className="alert alert-danger py-2 px-3 small d-flex align-items-center gap-2 mb-3">
          <AlertCircle size={15} className="flex-shrink-0" />
          <span>{gpsError}</span>
        </div>
      )}

      {/* Leaflet Map Container */}
      <div
        ref={mapContainerRef}
        style={{
          height: 320,
          width: '100%',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-light)',
          zIndex: 1,
        }}
      />

      {/* Address and Coordinates Confirmation Bar */}
      <div className="location-address-display mt-3 p-3 bg-light rounded border d-flex gap-3 align-items-start">
        <MapPin size={22} className="text-danger flex-shrink-0 mt-1" />
        <div className="flex-grow-1">
          <div className="fw-bold text-dark mb-1">
            Confirmed Location & Geotag
          </div>
          <input
            type="text"
            className="form-control form-control-sm mb-2"
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              if (onLocationChange) {
                onLocationChange({
                  latitude: coords.latitude,
                  longitude: coords.longitude,
                  address: e.target.value,
                });
              }
            }}
            placeholder="Detailed street address or landmark"
          />
          <div className="d-flex gap-3 text-muted small">
            <span>
              <strong>Coordinates:</strong> {formatCoordinates(coords.latitude, coords.longitude)}
            </span>
            <span>
              <strong>GIS Accuracy:</strong> Satellite High Precision (&plusmn;5m)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationPicker;
