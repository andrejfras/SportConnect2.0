import React, { useState, useEffect } from 'react';
import supabase from '../services/supabaseClient';

function Profile() {
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
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
          setLoading(false);
          return;
        }

        if (profile) {
          setUsername(profile.username);
          setBirthdate(profile.age);
          setName(profile.name)
          setSurname(profile.surname) // Set the age from the profile
        }
      }

      setLoading(false);
    };

    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    console.log(name);

    const userResponse = await supabase.auth.getUser();
    const { error } = await supabase
    .from('profiles')
    .update({ username, age: birthdate, name, surname })
    .eq('user_id', userResponse.data.user.id);


    if (error) {
      setMessage(error.message);
    } else {
      setMessage('Profile updated successfully!');
    }

    setLoading(false);
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1>Manage Profile</h1>
      <form onSubmit={handleUpdateProfile}>
        {/* Existing form fields */}
        <div>
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="birthdate">Date of Birth:</label>
            <input
              type="date"
              id="birthdate"
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
          />
        </div>
        <div>
          <label>Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label>Surname:</label>
          <input
            type="text"
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
          />
        </div>
        <button type="submit">Update Profile</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default Profile;