import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import './css/MapComponent.css';
import 'leaflet/dist/leaflet.css';

const MapComponent = ({ onLocationChange }) => {
  const [position, setPosition] = useState(null);

  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
        headers: { 'User-Agent': 'YourApp/1.0 (http://yourappwebsite.com)' } // Replace with your app's user agent
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      return data.display_name; // This is the full address
    } catch (error) {
      console.error('Error during reverse geocoding:', error);
      return null;
    }
  };

  const LocationMarker = () => {
    const map = useMapEvents({
      async click(e) {
        setPosition(e.latlng);
        const address = await reverseGeocode(e.latlng.lat, e.latlng.lng);
        if (onLocationChange && address) {
          onLocationChange(e.latlng, address);
        }
      },
    });

    return position === null ? null : (
      <Marker position={position}></Marker>
    );
  };

  return (
    <MapContainer center={{ lat: 45.5475390323761, lng: 13.7295627593994 }} zoom={14} style={{ height: '500px', width: '500px' }} className="map-container">
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <LocationMarker />
    </MapContainer>
  );
};

export default MapComponent;
