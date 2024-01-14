import React, { useState } from 'react';
import supabase from '../services/supabaseClient';
import MapComponent from './MapComponent'; 

function CreateEvent() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [coordinates, setCoordinates] = useState({ lat: null, lng: null });
  const [address, setAddress] = useState('');
  const [message, setMessage] = useState('');

  const handleMapClick = async (latLng) => {
    // Updated to access lat and lng as properties
    if (latLng && latLng.lat !== undefined && latLng.lng !== undefined) {
      setCoordinates({ lat: latLng.lat, lng: latLng.lng });

      const fetchedAddress = await reverseGeocode(latLng.lat, latLng.lng);
      setAddress(fetchedAddress); // Update the address state
    } else {
      console.error('Unexpected latLng object structure:', latLng);
    }
  };

  const reverseGeocode = async (lat, lng) => {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
  
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'YourApp/1.0 (your@email.com)' } // Replace with your app's user agent
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const data = await response.json();
      return data.display_name; // This is the full address
    } catch (error) {
      console.error('Error during reverse geocoding:', error);
      return '';
    }
  };
  
  
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    const session = supabase.auth.getSession();
    if (!session) {
      setMessage("You must be signed in to create events.");
      return;
    }

    // Validation for coordinates
    if (coordinates.lat === null || coordinates.lng === null) {
      setMessage('Please select a location on the map.');
      return;
    }

    const { error } = await supabase
      .from('events')
      .insert([{ title, description, date, location: [coordinates.lat, coordinates.lng], creator: (await session).data.session.user.email, address }]);
    
    if (error) {
      setMessage(error.message);
    } else {
      setMessage('Event created successfully!');
      // Reset form fields here if needed
      setTitle('');
      setDescription('');
      setDate('');
      setCoordinates({ lat: null, lng: null });
      setAddress('');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
      <MapComponent onLocationChange={handleMapClick} />
      {message && <p>{message}</p>}
      <button type="submit">Create Event</button>
    </form>
  );
}

export default CreateEvent;

