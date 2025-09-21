import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase'; // Make sure you have this file
import Home from './components/Home';
import Dashboard from './components/Dashboard'; // You will need to create this component
import Navbar from './components/Navbar';
import Chatbot from './components/Chatbot';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // This effect runs once when the app starts and listens for auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      // When the auth state changes, this function is called
      setUser(currentUser); // Sets the user to the logged-in user or null
      setLoading(false); // We're done loading
    });

    // Cleanup the listener when the component is no longer on the screen
    return () => unsubscribe();
  }, []); // The empty array [] ensures this effect only runs once

  // While Firebase is checking the user's auth status, show a loading message
  if (loading) {
    // You can replace this with a more stylish loading spinner component
    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">
            Loading...
        </div>
    );
  }

  return (
    // Use a React Fragment <> to return multiple components
    <>
      {/* The Navbar receives the user object to display different links (e.g., Logout) */}
      <Navbar user={user} />

      {/* This is the main content of the page */}
      {/* If 'user' exists (is not null), show the Dashboard. Otherwise, show the Home page. */}
      {user ? <Dashboard user={user} /> : <Home />}

      {/* The Chatbot component is included here so it can be displayed on all pages */}
      <Chatbot />
    </>
  );
}

export default App;