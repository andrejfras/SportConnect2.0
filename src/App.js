import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import supabase from './services/supabaseClient.js';
import Login from './views/Login.js';
import Signup from './views/Signup.js';
import Homepage from './views/Homepage.js'; 
import CreateEvent from './views/CreateEvent.js';
import Profile from './views/Profile.js';
import UserCreatedEvents from './views/UserCreatedEvents.js';
import UserProfile from './views/UserProfile.js';
import './App.css';



function Navbar({ username, onLogout, onSearch }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [user, setUser] = useState('');


  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length > 0) {
      const results = await onSearch(query);
      setSearchResults(results);
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  };


  const navigate = useNavigate();

  const handleUserClick = (userId) => {
    navigate(`/profile/${userId}`); // Navigate to user's profile
  };


  return (
    <nav className="navbar">
      <ul style={{ listStyleType: 'none', display: 'flex', justifyContent: 'space-around' }}>
        {username ? (
          <>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/create-event">Create Event</Link></li>
            <li><Link to="/profile">Profile</Link></li>
            <li><Link to="/user-events">My Events</Link></li>
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
      <form onSubmit={(e) => e.preventDefault()}>
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={handleSearchChange}
          onFocus={() => searchQuery.length > 0 && setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 300)} // Delay to allow click event on dropdown
        />
        {showDropdown && (
          <div className="search-dropdown">
            {/* Map through searchResults and display them */}
            {Array.isArray(searchResults) && searchResults.map((result, index) => (
              <div key={index} onClick={() => handleUserClick(result.user_id)} className="search-result-item">
                {console.log(result.user_id)}
                {result.username}
              </div>
            ))}
          </div>
        )}
        </form>
    </nav>
  );
}







function App() {
  const [username, setUsername] = useState(null);
  const [searchResults, setSearchResults] = useState([]);


  const handleSearch = async (query) => {
    const results = await searchUsers(query); // Make sure searchUsers always returns an array
    return results || []; // Return an empty array if results is falsy
  };

  const searchUsers = async (query) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('username', `%${query}%`);
  
      if (error) {
        throw error;
      }
  
      return data || []; // Return an empty array if data is falsy
    } catch (err) {
      console.error('Error searching users:', err);
      return []; // Return an empty array in case of an error
    }
  };



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
        setUsername(username); // Set username on sign in
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
      <Navbar username={username} onLogout={handleLogout} onSearch={handleSearch} />
        <div className="content-container">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Signup />} />
          <Route path="/" element={<Homepage />} />
          <Route path="/create-event" element={<CreateEvent username={username} />} />
          <Route path="/user-events" element={<UserCreatedEvents username={username} />} />
          <Route path="/profile" element={<Profile />} /> {/* New route for creating events */}
          <Route path="/profile/:userId" element={<UserProfile />} />
        </Routes>
        {searchResults && searchResults.length > 0 && (
          <div>
            
                {Array.isArray(searchResults) && searchResults.map((user, index) => (
                  <div key={index} className="search-result">
                    <p>Username: {user.username}</p>
                    <p>Name: {user.name}</p>
                    {/* Other user details */}
                  </div>
                ))}
              </div>
          )}
        </div>
      </div>
    </Router>
  );
}

export default App;