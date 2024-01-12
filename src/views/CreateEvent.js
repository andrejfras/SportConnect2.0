import React, { useState, useEffect } from 'react';
import supabase from '../services/supabaseClient'; // Import your Supabase client

function CreateEvent() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [message, setMessage] = useState('');
  const [creator, setCreatorEmail] = useState('');
  const user = supabase.auth.getUser();




  const handleSubmit = async (e) => {
    e.preventDefault();

    const {
        data: { session },
      } = await supabase.auth.getSession()
      const { user } = session

    setCreatorEmail(session.user.email)
      

    // Assuming you have a table named 'events' in your Supabase database
    const { data, error } = await supabase
      .from('events')
      .insert([{ title, description, date, creator}]);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage('Event created successfully!');
    // Clear form fields
    setTitle('');
    setDescription('');
    setDate('');
  };

  if (!user) {
    return <p>You must be signed in to create events.</p>; // Or redirect to login page
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Create Event</h2>
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
      <button type="submit">Create Event</button>
      {message && <p>{message}</p>}
    </form>
  );
}

export default CreateEvent;
