import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import supabase from './services/supabaseClient.js';
import Login from './views/Login.js';
import Signup from './views/Signup.js';
import Homepage from './views/Homepage.js'; 
import CreateEvent from './views/CreateEvent.js';
import Profile from './views/Profile.js';
import './App.css';


function Navbar({ username, onLogout }) {

  return (
    <nav className="navbar">
      <ul style={{ listStyleType: 'none', display: 'flex', justifyContent: 'space-around' }}>
        {username ? (
          <>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/create-event">Create Event</Link></li>
            <li><Link to="/profile">My Profile</Link></li>
            <li>{username && <div className='welcome-message'>Welcome, {username}</div>}</li>
            <button onClick={onLogout} style={{ marginLeft: '10px' }}>Sign Out</button>
          </>
        ) : (
          <>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register">Register</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
}




function App() {
  const [username, setUsername] = useState(null);

  useEffect(() => {
    const checkSession = async () => {
      const session = supabase.auth.getSession();

      if (session) {
        // Assuming the user's email is used as the username
        // Replace 'email' with the appropriate field if different
     //   setUsername(session.data.user.email);
      }
    };

    checkSession();

    const fetchProfile = async () => {
      const userResponse = await supabase.auth.getUser();
      const user = userResponse.data;
    
      if (user && user.user && user.user.id) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.user.id)
          .single();
    
        if (error) {
          console.error('Error fetching profile:', error);
          return;
        }
    
        if (profile) {
          setUsername(profile.username);
        }
      }
    };

    fetchProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN') {
        setUsername(session.user.email); // Set username on sign in
      }
      if (event === 'SIGNED_OUT') {
        setUsername(null); // Clear username on sign out
      }
    });

    // Cleanup the listener when the component unmounts

    // Clean up the listener when the component is unmounted
    return () => {
      if (authListener) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const handleLogout = async () => {
    // Logic for handling logout
    await supabase.auth.signOut();
    setUsername(null);
  };




  return (
    <Router>
      <div>
      <Navbar username={username}  onLogout={handleLogout}/>
        <div className="content-container">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Signup />} />
          <Route path="/" element={<Homepage />} />
          <Route path="/create-event" element={<CreateEvent username={username} />} />
          <Route path="/profile" element={<Profile />} /> {/* New route for creating events */}
          {/* Add other routes as needed */}
        </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;