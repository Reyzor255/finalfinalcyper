import { useEffect, useRef } from 'react';
import './MapPage.css';

function MapPage({ onBack, locationString, detectedWord }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    // Only load map if we have location data
    if (!locationString || !mapContainerRef.current) return;

    const [lat, lng] = locationString.split(',').map(coord => parseFloat(coord.trim()));

    if (isNaN(lat) || isNaN(lng)) {
      console.error('Invalid coordinates');
      return;
    }

    // Load Leaflet CSS and JS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
    script.async = true;
    script.onload = () => {
      const L = window.L;
      
      // Create map
      mapRef.current = L.map(mapContainerRef.current).setView([lat, lng], 15);

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapRef.current);

      // Add marker at detected location
      L.marker([lat, lng], {
        title: 'Detection Location',
      })
        .bindPopup(`<strong>Threat Detection Location</strong><br/>Detected: ${detectedWord || 'Unknown'}<br/>Lat: ${lat.toFixed(6)}<br/>Lng: ${lng.toFixed(6)}`)
        .addTo(mapRef.current)
        .openPopup();
    };

    document.head.appendChild(script);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [locationString, detectedWord]);

  return (
    <div className="map-container">
      <div className="map-header">
        <button onClick={onBack} className="btn btn-secondary back-btn">
          ← Back to Recording
        </button>
        <h1 className="map-title">Detection Location Map</h1>
      </div>

      <div className="map-content">
        <div className="map-info-card">
          <h2>Incident Location</h2>
          {locationString ? (
            <>
              <p className="coordinates">
                <strong>Coordinates:</strong> {locationString}
              </p>
              <p className="detected-info">
                <strong>Threat:</strong> {detectedWord || 'Unknown'}
              </p>
              <a 
                href={`https://www.google.com/maps?q=${locationString}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary map-link-btn"
              >
                Open in Google Maps
              </a>
            </>
          ) : (
            <p className="error-msg">Location data not available</p>
          )}
        </div>

        <div className="map-wrapper">
          <div className="map-canvas" ref={mapContainerRef}></div>
        </div>
      </div>
    </div>
  );
}

export default MapPage;
