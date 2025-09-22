import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase'; // Make sure you have this file
import Home from './components/Home';
import Dashboard from './components/Dashboard';
import Navbar from './components/Navbar';
import Chatbot from './components/Chatbot';
import PaperTradingApp from './components/PaperTradingApp';
import Squads from './components/Squads';
import UserProfile from './components/UserProfile';
import Rewards from './components/Rewards';
import Insights from './components/Insights';
import Personalization from './components/Personalization';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [appView, setAppView] = useState('dashboard'); // 'home' | 'dashboard' | 'papertrading' | 'squads' | 'profile' | 'rewards' | 'insights'
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [rewards, setRewards] = useState([]);

  const handleLogout = async () => {
    try {
      if (auth.currentUser) {
        await auth.signOut();
      }
    } catch (e) {
      // no-op for mock users
    } finally {
      setUser(null);
      setAppView('dashboard');
    }
  };

  const handleMockLogin = () => {
    setUser({ email: 'guest@local' });
    setAppView('dashboard');
  };

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
    <>
      {user && (
        <Navbar
          user={user}
          appView={appView}
          onChangeView={setAppView}
          onLogout={handleLogout}
        />
      )}

      {!user && <Home onMockLogin={handleMockLogin} />}

      {user && (
        appView === 'home' ? (
          <Home hideHeader={true} />
        ) : appView === 'dashboard' ? (
          <Dashboard user={user} />
        ) : appView === 'papertrading' ? (
          <PaperTradingApp />
        ) : appView === 'squads' ? (
          <Squads
            currentUser={user}
            onOpenProfile={(profile) => { setSelectedProfile(profile); setAppView('profile'); }}
            onGoToRewards={() => setAppView('rewards')}
          />
        ) : appView === 'profile' ? (
          <UserProfile
            profile={selectedProfile}
            onBack={() => setAppView('squads')}
          />
        ) : appView === 'rewards' ? (
          <Rewards onBack={() => setAppView('squads')} rewards={rewards} />
        ) : appView === 'insights' ? (
          <Insights />
        ) : appView === 'personalization' ? (
          <Personalization
            onBack={() => setAppView('dashboard')}
            onRewardsGenerated={(newRewards) => { setRewards((prev) => [...newRewards, ...prev]); setAppView('rewards'); }}
          />
        ) : (
          <Dashboard user={user} />
        )
      )}

      <Chatbot />
    </>
  );
}

export default App;