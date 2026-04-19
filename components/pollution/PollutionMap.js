'use client';
import { useEffect, useRef } from 'react';

const AQI_COLORS = ['', '#10d870', '#a8d020', '#f0a020', '#f06020', '#f03050'];

export default function PollutionMap({ lat, lon, aqi }) {
  const mapRef = useRef(null);
  const instanceRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current || !lat || !lon) return;

    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    import('leaflet').then(({ default: L }) => {
      if (instanceRef.current) {
        instanceRef.current.remove();
        instanceRef.current = null;
      }

      const map = L.map(mapRef.current, {
        center: [lat, lon],
        zoom: 11,
        zoomControl: true,
        attributionControl: true,
      });
      instanceRef.current = map;

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© <a href="https://openstreetmap.org">OSM</a> © <a href="https://carto.com">CARTO</a>',
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      const color = AQI_COLORS[aqi] || '#10d870';

      const icon = L.divIcon({
        html: `<div style="
          width:42px;height:42px;
          background:${color};
          border:3px solid #000;
          box-shadow:3px 3px 0 #000,0 0 24px ${color}99;
          display:flex;align-items:center;justify-content:center;
          font-family:monospace;font-weight:900;font-size:15px;color:#000;
        ">${aqi}</div>`,
        className: '',
        iconSize: [42, 42],
        iconAnchor: [21, 21],
      });

      L.marker([lat, lon], { icon }).addTo(map);

      L.circle([lat, lon], {
        radius: 10000,
        color,
        fillColor: color,
        fillOpacity: 0.07,
        weight: 2,
      }).addTo(map);
    });

    return () => {
      if (instanceRef.current) {
        instanceRef.current.remove();
        instanceRef.current = null;
      }
    };
  }, [lat, lon, aqi]);

  return (
    <div
      ref={mapRef}
      style={{ width: '100%', height: '320px' }}
    />
  );
}
