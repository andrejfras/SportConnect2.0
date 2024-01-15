import React from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const MiniMapComponent = ({ coordinates }) => {
  // If coordinates are not provided, do not render the map
  if (!coordinates || coordinates.length !== 2) {
    return null;
  }

  const position = [coordinates[0], coordinates[1]];

  return (
    <MapContainer 
      center={position} 
      zoom={17} 
      style={{ height: '300px', width: '100%'}}
      scrollWheelZoom={false} // Disable scroll wheel zoom
      dragging={false} // Disable dragging
      touchZoom={false} // Disable touch zoom
      doubleClickZoom={false} // Disable double click zoom
      zoomControl={false} // Disable zoom control
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={position} />
    </MapContainer>
  );
};

export default MiniMapComponent;