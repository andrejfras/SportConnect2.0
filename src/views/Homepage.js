import React, { useEffect, useState } from 'react';
import supabase from '../services/supabaseClient';
import './css/Homepage.css';
import MiniMapComponent from './MiniMapComponent';

function Homepage() {
  const [events, setEvents] = useState([]);
  const [sports, setSports] = useState({});

  useEffect(() => {
    const fetchSportsAndEvents = async () => {
      const { data: sportsData } = await supabase.from('sports').select('*');
      const sportsMap = {};
      sportsData.forEach(sport => {
        sportsMap[sport.id] = sport.name;
      });
      setSports(sportsMap);
      const { data, error } = await supabase.from('events').select('*');
      if (error) {
        console.error('Error fetching events:', error);
      } else {
        const sortedData = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setEvents(sortedData);
      }
    };

    fetchSportsAndEvents();
  }, []);

  function formatDateTime(dateTimeStr) {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
  
    return new Date(dateTimeStr).toLocaleString('en-US', options);
  }

  return (
    <div>
      {events.map(event => (
        <div key={event.id} className="event-box">
          <h3 className="event-title">{event.title}</h3>
          <p>Sport: {sports[event.sport_id]}</p>
          <p className="event-description">{event.description}</p>
          <p>Date and Time: {formatDateTime(event.date)}</p>
          <p className="event-details">Created by: {event.creator}</p>
          {event.location && (
            <div>
              <p>Location: Latitude: {event.location[0]}, Longitude: {event.location[1]}</p>
              <p>Address: {event.address}</p>
              <MiniMapComponent coordinates={event.location} />
            </div>
          )}
          {/* More event details */}
        </div>
      ))}
    </div>
  );
}

export default Homepage;
