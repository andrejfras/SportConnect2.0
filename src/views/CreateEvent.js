import React, { useState, useEffect } from 'react';
import supabase from '../services/supabaseClient';
import MapComponent from './MapComponent'; 
import './css/CreateEvent.css';


function CreateEvent() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [creator, setCreator] = useState('');
  const [coordinates, setCoordinates] = useState({ lat: null, lng: null });
  const [address, setAddress] = useState('');
  const [message, setMessage] = useState('');
  const [sports, setSports] = useState([]);
  const [selectedSport, setSelectedSport] = useState('');
  const [time, setTime] = useState('');

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

  
  
  useEffect(() => {
    const fetchSports = async () => {
      console.log('Fetching sports...');  // Initial log
      const { data, error } = await supabase.from('sports').select('*');
      if (error) {
        console.error('Error fetching sports:', error);
      } else if (data) {
        console.log('Fetched sports:', data);  // Log fetched data
        setSports(data);
      } else {
        console.log('No data received');
      }
    };
  
    fetchSports();
  
    const fetchProfile = async () => {
      const user = supabase.auth.getUser();
      console.log("User object:", supabase.auth.getUser());
        console.log("User ID:", supabase.auth.getUser());

      if (user) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', (await user).data.user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
       //   setLoading(false);
          return;
        }

        if (profile) {
          setCreator(profile.username);
          
        }
      }

    //  setLoading(false);
    };

    fetchProfile();
  }, []);

  
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    const session = supabase.auth.getSession();
    if (!session) {
      setMessage("You must be signed in to create events.");
      return;
    }

    const dateTime = `${date}T${time}`;

    // Validation for coordinates
    if (coordinates.lat === null || coordinates.lng === null) {
      setMessage('Please select a location on the map.');
      return;
    }

    const { error } = await supabase
      .from('events')
      .insert([{ title, description, date: dateTime, location: [coordinates.lat, coordinates.lng], creator: creator, address, sport_id: selectedSport, event_attendees: [(await supabase.auth.getUser()).data.user.id]}]);
    
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
      setSelectedSport('')
    }
  };

  return (
  
      <form onSubmit={handleSubmit} className="create-event-form">
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="form-input"
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="form-textarea"
      />

     
      <label htmlFor="date" className="form-label">Date:</label>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="form-input"
      />
       
    
      <label htmlFor="time" className="form-label">Time:</label>
        <input
          type="time"
          id="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="form-input"
      />

      <label htmlFor="sport" className="form-label">Choose a sport:</label>
        <select
          id="sport"
          value={selectedSport}
          onChange={(e) => setSelectedSport(e.target.value)}
          className="form-select"
        >
        <option value="">Select a sport</option> 
          {sports.map(sport => (
            <option key={sport.id} value={sport.id}>{sport.name}</option>
          ))}
      </select>
      <label htmlFor="sport" className="form-label">Select event location:</label>
      <MapComponent onLocationChange={handleMapClick} />
      {message && <p>{message}</p>}

      
      <button type="submit">Create Event</button>

    </form>
  );
}

export default CreateEvent;

