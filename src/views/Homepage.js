import React, { useEffect, useState, useCallback } from 'react';
import supabase from '../services/supabaseClient';
import './css/Homepage.css';
import MiniMapComponent from './MiniMapComponent';

function Homepage() {
  const [events, setEvents] = useState([]);
  const [sports, setSports] = useState({});
  const [userId, setUserId] = useState('');

  const getMaxUsersForEvent = useCallback(async (eventId) => {
    const event = await getEventById(eventId);
    const sport = await getSportById(event.sport_id);
    return sport.playerNum;
  }, []);

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

      const updatedEvents = await Promise.all(data.map(async (event) => {
        const maxUsers = await getMaxUsersForEvent(event.id);
        return { ...event, maxUsers };
      }));
    
      setEvents(updatedEvents);
    };

    fetchSportsAndEvents();

    const checkSession = async () => {
      const session = supabase.auth.getSession();

      if (session) {
        setUserId((await session).data.session.user.id)
      }
    };

    checkSession();

},[getMaxUsersForEvent]);

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

async function attendEvent(eventId) {
    const id = (await supabase.auth.getUser()).data.user.id;
    // Step 1: Retrieve the current attendees array for the event
    const { data: eventData, error: retrieveError } = await supabase
        .from('events')
        .select('event_attendees')
        .eq('id', eventId)
        .single();

    if (retrieveError) {
        console.error('Error retrieving event data:', retrieveError);
        return false;
    }

    // Check if the user is already attending the event
    if (eventData.event_attendees && eventData.event_attendees.includes(id)) {
        console.log('User is already attending the event');
        return false;
    }

    // Step 2: Append the new username to the attendees array
    const updatedAttendees = eventData.event_attendees ? [...eventData.event_attendees, id] : [id];

    // Step 3: Update the event with the new attendees array
    const { error: updateError } = await supabase
        .from('events')
        .update({ event_attendees: updatedAttendees })
        .eq('id', eventId);

    if (updateError) {
        console.error('Error updating event attendees:', updateError);
        return false;
    }

    console.log('Attendee added successfully');
    if (!updateError) {
      console.log('Attendee removed successfully');
      
      // Update the events state
      setEvents(prevEvents => prevEvents.map(event => {
        if (event.id === eventId) {
          return {
            ...event,
            event_attendees: updatedAttendees
          };
        }
        return event;
      }));
    }
  
    return !updateError;
}

async function getEventById(eventId) {
  try {
      const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('id', eventId)
          .single();

      if (error) {
          throw error;
      }

      return data;
  } catch (err) {
      console.error('Error fetching event:', err);
      throw err;
  }
}

async function getSportById(sportId) {
  try {
      const { data, error } = await supabase
          .from('sports')
          .select('*')
          .eq('id', sportId)
          .single();

      if (error) {
          throw error;
      }

      return data;
  } catch (err) {
      console.error('Error fetching sport:', err);
      throw err;
  }
}


async function addAttendeeToEvent(eventId) {
  const event = await getEventById(eventId);
  const sport = await getSportById(event.sport_id);
  const currentAttendees = event.event_attendees.length;

  if (currentAttendees.length >= sport.playerNum) {
      throw new Error("Attendee limit reached for this event.");
  }

  attendEvent(event.id);
}

async function unattendEvent(eventId) {
  // Retrieve the current attendees array for the event
  const { data: eventData, error: retrieveError } = await supabase
      .from('events')
      .select('event_attendees')
      .eq('id', eventId)
      .single();

  const id= (await supabase.auth.getUser()).data.user.id;

  if (retrieveError) {
      console.error('Error retrieving event data:', retrieveError);
      return false;
  }

  // Remove the username from the attendees array
  const updatedAttendees = eventData.event_attendees.filter(u => u !== id);

  // Update the event with the new attendees array
  const { error: updateError } = await supabase
      .from('events')
      .update({ event_attendees: updatedAttendees })
      .eq('id', eventId);

  if (updateError) {
      console.error('Error updating event attendees:', updateError);
      return false;
  }

  if (!updateError) {
    console.log('Attendee removed successfully');
    
    // Update the events state
    setEvents(prevEvents => prevEvents.map(event => {
      if (event.id === eventId) {
        return {
          ...event,
          event_attendees: updatedAttendees
        };
      }
      return event;
    }));
  }

  return !updateError;
}



  return (
    <div>
      {events.map(event => (
        <div key={event.id} className="event-box">
          <div className = "event-info">
            <h2 className="event-title">{event.title}</h2>
            <h4>Sport: {sports[event.sport_id]}</h4>
            <p className="event-description">{event.description}</p>
            <p>Date and Time: {formatDateTime(event.date)}</p>
            <p>Address: {event.address}</p>
           
            <div><p className="event-details">Created by: {event.creator}</p><p>Number of Attendees: {event.event_attendees.length}/{event.maxUsers}</p></div>
            {event.event_attendees.includes(userId) ? (
                <button className="attbutton" onClick={() => unattendEvent(event.id)}>Unattend Event</button>
              ) : (
                <button className="attbutton" onClick={() => addAttendeeToEvent(event.id)}>Attend Event</button>
            )}
          </div>
          <div className="map">
            {event.location && (
              <div>
                
                <MiniMapComponent coordinates={event.location} />
              </div>
            )}
          </div>
          {/* More event details */}
        </div>
      ))}
    </div>
  );
}

export default Homepage;
