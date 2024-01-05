import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import supabase from './services/supabaseClient.js';
import Login from './views/Login.js';
import Signup from './views/Signup.js';
import Homepage from './views/Homepage.js'; 
import CreateEvent from './views/CreateEvent.js';
import './App.css';


function Navbar({ username }) {
  return (
    <nav className="navbar">
      <ul style={{ listStyleType: 'none', display: 'flex', justifyContent: 'space-around' }}>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/login">Login</Link></li>
        <li><Link to="/register">Register</Link></li>
        <li><Link to="/create-event">Create Event</Link></li>
        {username && (
        <div className="welcome-message">
          Welcome, {username}
        </div>
      )}
        {/* Add other navbar items as needed */}
      </ul>
    </nav>
  );
}


function App() {
  const [username, setUsername] = useState(null);

  useEffect(() => {
    const fetchUsername = async () => {
     // const user = supabase.auth.getSession();

      const {
        data: { session },
      } = await supabase.auth.getSession()
      const { user } = session


      if (user) {
        // Query the profiles table to get the username
        const { data, error } = await supabase
          .from('profiles')
          .select('username')
          .eq('user_id', session.user.id)  // Assuming 'id' is the column that relates to the user's ID
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
        } else {
          setUsername(data.username);
        }
      }
    };

    fetchUsername();

    // Handle auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        fetchUsername(); // Fetch username again if auth state changes
      } else {
        setUsername(null); // Clear username if user logs out
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
 




  return (
    <Router>
      <div>
      <Navbar username={username} />
        <div className="content-container">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Signup />} />
          <Route path="/" element={<Homepage />} />
          <Route path="/create-event" element={<CreateEvent />} /> {/* New route for creating events */}
          {/* Add other routes as needed */}
        </Routes>
        </div>

        {username && (
        <div className="welcome-message">
          Welcome, {username}
        </div>
      )}
      </div>
    </Router>
  );
}

export default App;