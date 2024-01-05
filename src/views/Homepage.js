import React, { useEffect, useState } from 'react';
import supabase from '../services/supabaseClient';

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
        <div key={event.id}>
          <h3>{event.title}</h3>
          <p>{event.description}</p>
          <p>{event.date}</p>
          <p>Created by: {event.creator}</p>
          {/* More event details */}
        </div>
      ))}
    </div>
  );
}

export default Homepage;
