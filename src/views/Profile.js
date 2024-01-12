import React, { useState, useEffect } from 'react';
import supabase from '../services/supabaseClient';

function Profile() {
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [age, setAge] = useState(''); // New state for age
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
          setAge(profile.age); // Set the age from the profile
        }
      }

      setLoading(false);
    };

    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from('profiles')
      .update({ username, age }) // Include age in the update
      .eq('user_id', supabase.auth.getUser().id);

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
          <label>Age:</label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />
        </div>
        <button type="submit">Update Profile</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default Profile;