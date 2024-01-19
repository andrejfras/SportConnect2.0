import React, { useEffect, useState } from 'react';
import supabase from '../services/supabaseClient'; // adjust the path as needed

function UserCreatedEvents() {
  const [userEvents, setUserEvents] = useState([]);
  const [loading, setLoading] = useState('');
  const [sports, setSports] = useState({});
  const [userId, setUser] = useState('');
  const [editingEvent, setEditingEvent] = useState(null);


  useEffect(() => {

    const fetchProfile = async () => {
        setLoading(true)
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
            setLoading(false);
            return;
          }
  
          if (profile) {
            fetchUserEvents(profile.user_id)
            setUser(profile.username) // Set the age from the profile
          }
        }
  
        setLoading(false);
      };
  
      fetchProfile();

    const fetchUserEvents = async () => {

    
        const { data: sportsData } = await supabase.from('sports').select('*');
        const sportsMap = {};
        sportsData.forEach(sport => {
            sportsMap[sport.id] = sport.name;
        });
        setSports(sportsMap);

      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('creator', userId); // assuming the column for creator/user is 'creator'
          
        if (error) {
          throw error;
        }

        setUserEvents(data);
      } catch (err) {
        console.error('Error fetching user events:', err);
      }
    };

    if (userId) {
      fetchUserEvents();
    }
  }, [userId]);

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

const deleteEvent = async (eventId) => {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) {
        throw error;
      }

      // Remove the event from the state
      setUserEvents(userEvents.filter(event => event.id !== eventId));
    } catch (err) {
      console.error('Error deleting event:', err);
    }
  };

const handleEditEventSubmit = async (e, eventId) => {
  e.preventDefault();

  const updatedEvent = {
      title: e.target.title.value,
      description: e.target.description.value,
      // other fields like description, date, etc.
  };

  try {
      const { error } = await supabase
          .from('events')
          .update(updatedEvent)
          .eq('id', eventId);

      if (error) {
          throw error;
      }

      // Update the event in the userEvents state
      setUserEvents(userEvents.map(event => 
          event.id === eventId ? { ...event, ...updatedEvent } : event
      ));

      setEditingEvent(null);
  } catch (err) {
      console.error('Error updating event:', err);
  }
};

  return (
    <div>
       
      <h2>Events Created by Me</h2>
      {editingEvent && (
            <form onSubmit={(e) => handleEditEventSubmit(e, editingEvent.id)}>
                <input type="text" defaultValue={editingEvent.title} name="title" />
                <input type="text" defaultValue={editingEvent.description} name="description" />
          
                <button type="submit">Save Changes</button>
                <button onClick={() => setEditingEvent(null)}>Cancel</button>
            </form>
      )}
      {userEvents.length > 0 ? (
        userEvents.map(event => (
        <div key={event.id} className="event-box">
          <div className = "event-info">
            <h2 className="event-title">{event.title}</h2>
            <h4>Sport: {sports[event.sport_id]}</h4>
            <p className="event-description">{event.description}</p>
            <p>Date and Time: {formatDateTime(event.date)}</p>
            <p>Address: {event.address}</p>
           <div>
            <p className="event-details">Created by: {event.creator}</p>
            <p>Number of Attendees: {event.event_attendees.length}/{event.maxUsers}</p>
            </div>
            <button onClick={() => setEditingEvent(event)}>Edit Event</button>
            <button onClick={() => deleteEvent(event.id)}>Delete Event</button>
          </div>
        </div>
        ))
        
      ) : (
        <p>No events created yet. {userId}</p>
     
      )}
    </div>
  );
}

export default UserCreatedEvents;
