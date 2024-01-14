import React, { useEffect, useState } from 'react';
import supabase from '../services/supabaseClient';
import './css/Homepage.css';
import MiniMapComponent from './MiniMapComponent';

function Homepage() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase.from('events').select('*');
      if (error) {
        console.error('Error fetching events:', error);
      } else {
        const sortedData = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setEvents(sortedData);
      }
    };

    fetchEvents();
  }, []);

  return (
    <div>
      {events.map(event => (
        <div key={event.id} className="event-box">
          <h3 className="event-title">{event.title}</h3>
          <p className="event-description">{event.description}</p>
          <p className="event-details">{event.date}</p>
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
