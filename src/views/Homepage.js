import React, { useEffect, useState } from 'react';
import supabase from '../services/supabaseClient';
import './css/Homepage.css';
import MiniMapComponent from './MiniMapComponent';

function Homepage() {
  const [events, setEvents] = useState([]);
  const [sports, setSports] = useState({});
  const [userId, setUserId] = useState('');

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
          setUserId(profile.user_id);
          
        }
      }

    //  setLoading(false);
    };

    fetchProfile();

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

  console.log('Attendee removed successfully');
  return true;
}
/*
function isAttending(event, username) {
  return event.event_attendees.includes(username);
}
*/


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
            {event.event_attendees.includes(userId) ? (
            <button onClick={() => unattendEvent(event.id)}>Unattend Event</button>
          ) : (
            <button onClick={() => attendEvent(event.id)}>Attend Event</button>
          )}
          {/* More event details */}
        </div>
      ))}
    </div>
  );
}

export default Homepage;
