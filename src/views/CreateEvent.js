import React, { useState } from 'react';
import supabase from '../services/supabaseClient'; // Import your Supabase client

function CreateEvent() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Retrieve the current user's session to get their email
    const session = supabase.auth.getSession();

    if (!session) {
      setMessage("You must be signed in to create events.");
      return;
    }

    const creatorEmail = (await session).data.session.user.email;

    // Assuming you have a table named 'events' in your Supabase database
    const { error } = await supabase
      .from('events')
      .insert([{ title, description, date, creator: creatorEmail }]);

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
/*
  // Check if the user is signed in before displaying the form
  const user = supabase.auth.getUser();
  if (!user) {
    return <p>You must be signed in to create events.</p>; // Or redirect to login page
  }

  */

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
