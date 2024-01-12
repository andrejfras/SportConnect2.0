import React, { useEffect, useState } from 'react';
import supabase from '../services/supabaseClient';
import './css/Homepage.css';

function Homepage() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase.from('events').select('*');
      if (error) {
        console.error('Error fetching events:', error);
      } else {
        setEvents(data);
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
          {/* More event details */}
        </div>
      ))}
    </div>
  );
}

export default Homepage;
