import React, { useEffect, useState, useCallback } from 'react';
import supabase from '../services/supabaseClient';
import './css/Homepage.css';
import MiniMapComponent from './MiniMapComponent';
import { Link } from 'react-router-dom';

function Homepage() {
  const [events, setEvents] = useState([]);
  const [sports, setSports] = useState({});
  const [userId, setUserId] = useState('');
  const [averageRating, setAverageRating] = useState(0);
  const [comments, setComments] = useState({}); // Object with event IDs as keys and arrays of comments as values
  const [userProfiles, setUserProfiles] = useState({});

  const getMaxUsersForEvent = useCallback(async (eventId) => {
    const event = await getEventById(eventId);
    const sport = await getSportById(event.sport_id);
    return sport.playerNum;
  }, []);

  
  useEffect(() => {

      const checkSession = async () => {
        const session = supabase.auth.getSession();

        if (session) {
           setUserId((await session).data.session.user.id)
        }
      };

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

        const updatedEventsWithRatings = await Promise.all(updatedEvents.map(async (event) => {
          const { data: ratingsData } = await supabase
              .from('user_ratings')
              .select('rating')
              .eq('ratee_id', fetchProfileByUsername(event.creator)); // Assuming 'creator' holds the user ID of the creator

          let avgRating = 0;
          if (ratingsData && ratingsData.length > 0) {
              const total = ratingsData.reduce((acc, { rating }) => acc + rating, 0);
              avgRating = total / ratingsData.length;
          }

          return { ...event, creatorAvgRating: avgRating };
      }));

      const updatedEventsWithProfiles = await Promise.all(updatedEventsWithRatings.map(async (event) => {
        const userId = await fetchProfileByUsername(event.creator);
        return { ...event, creatorId: userId };
      }));

      setEvents(updatedEventsWithProfiles);
      };

      fetchSportsAndEvents();

      checkSession();


  },[getMaxUsersForEvent]);

  useEffect(() => {
    const fetchAvgRating  = async () => {
        if (userId) {
            const { data: ratingsData, error: ratingsError } = await supabase
                .from('user_ratings') // Replace 'ratings' with your actual table name
                .select('rating')
                .eq('ratee_id', userId);
    
            if (ratingsError) {
                console.error('Error fetching ratings:', ratingsError);
            } else if (ratingsData.length > 0) {
                const total = ratingsData.reduce((acc, { rating }) => acc + rating, 0);
                const avgRating = total / ratingsData.length;
                setAverageRating(avgRating);
            } else {
                setAverageRating(0); // Set to 0 if no ratings found
            }
        }
    };

    console.log(averageRating);

    fetchAvgRating();
  }, [userId, averageRating]);


  // Function to fetch comments for an event
  const fetchComments = async (eventId) => {
    try {
      const { data: commentsData, error } = await supabase.from('comments').select('*').eq('event_id', eventId);
      if (error) {
        console.error('Error fetching comments:', error);
        return;
      }
  
      // Fetch user profiles for each comment
      const profiles = await Promise.all(commentsData.map(async comment => {
        return await fetchProfileById(comment.user_id);
      }));
  
      // Update comments and user profiles state
      setComments(prevComments => ({ ...prevComments, [eventId]: commentsData }));
      setUserProfiles(prevProfiles => ({ ...prevProfiles, ...profiles }));
    } catch (err) {
      console.error('Error in fetchComments:', err);
    }
  };

  // Call fetchComments when the component mounts or when events change
  useEffect(() => {
    events.forEach(event => fetchComments(event.id));
  }, [events]);

  const submitComment = async (userId, eventId, commentText) => {

    // Construct a new comment object
    const newComment = {
      event_id: eventId,
      user_id: userId,
      username: await fetchProfileById(userId), // You need to pass the userId as an argument or get it from your auth state
      comment: commentText, // Optional: Handle timestamp in your backend or DB
    };
  
    // API call to submit comment to Supabase
    const { data, error } = await supabase
      .from('comments') // Assuming 'comments' is your table name
      .insert([newComment]);
  
    if (error) {
      console.error('Error submitting comment:', error);
      return; // Handle the error appropriately
    }
  
    // Assuming the data returned includes the new comment with an id
    const submittedComment = newComment;
  
    // Update comments state to immediately show the new comment
    setComments(prevComments => ({
      ...prevComments,
      [eventId]: [...(prevComments[eventId] || []), submittedComment]
    }));
  };

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
      alert('You have successfully attended the event!');
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

  async function fetchProfileByUsername(username) {
    try {
        const { data, error } = await supabase
            .from('profiles') // Assuming 'profiles' is your table name
            .select('*')
            .eq('username', username) // 'username' is the column in your table
            .single(); // Use 'single' if you expect only one record

        if (error) {
            throw error;
        }

        console.log(data.user_id);

        return data.user_id;
    } catch (err) {
        console.error('Error fetching profile:', err);
        // Handle the error appropriately
        return null;
    }
}

async function fetchProfileById(id) {
  try {
      const { data, error } = await supabase
          .from('profiles') // Assuming 'profiles' is your table name
          .select('*')
          .eq('user_id', id) // 'username' is the column in your table
          .single(); // Use 'single' if you expect only one record

      if (error) {
          throw error;
      }

      console.log(data.user_id);

      return data.username;
  } catch (err) {
      console.error('Error fetching profile:', err);
      // Handle the error appropriately
      return null;
  }
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
    alert('You are no longer attending the event');
    
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
        <div>
        <div key={event.id} className="event-box">
          <div className = "event-info">
            <h2 className="event-title">{event.title}</h2>
            <h4>Sport: {sports[event.sport_id]}</h4>
            <p className="event-description">{event.description}</p>
            <p>Date and Time: {formatDateTime(event.date)}</p>
            <p>Address: {event.address}</p>
           
            <div>
            <p className="event-details">
              Created by: 
              <Link to={`/profile/${event.creatorId}`}>
                {event.creator}
              </Link></p>
            
            <p>Number of Attendees: {event.event_attendees.length}/{event.maxUsers}</p></div>
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
      <div className="comments-section">
            <h3>Comments</h3>
            {comments[event.id] && comments[event.id].length > 0 ? (
              comments[event.id].map(comment => (
                <div key={comment.id} className="comment">
                   <p>{comment.username} : {comment.comment}</p>
                  {/* other comment details */}
                </div>
              ))
            ) : (
              <p>No comments yet.</p>
            )}
            <form onSubmit={(e) => {
              e.preventDefault();
              submitComment(userId, event.id, e.target.commentText.value); // Ensure you pass the userId
              e.target.reset(); // Reset form after submit
            }}>
              <input type="text" name="commentText" placeholder="Add a comment" required />
              <button type="submit">Post Comment</button>
            </form>
          </div>
      </div>
      ))}
    </div>
  );
}

export default Homepage;
