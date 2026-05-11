import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase'; // Make sure you have this file
import { getOrCreateUserProfile, getUserProfile } from './services/userProfile';
import { getUserTransactions, saveUserTransaction } from './services/transactions';
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
  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [transactionError, setTransactionError] = useState(null);

  const refreshCurrentUserProfile = async () => {
    if (!user?.uid) return null;
    const profile = await getUserProfile(user.uid);
    setCurrentUserProfile(profile);
    return profile;
  };

  const handleLogout = async () => {
    try {
      if (auth.currentUser) {
        await auth.signOut();
      }
    } catch {
      // no-op for mock users
    } finally {
      setUser(null);
      setCurrentUserProfile(null);
      setSelectedProfile(null);
      setTransactions([]);
      setTransactionError(null);
      setAppView('dashboard');
    }
  };

  const handleMockLogin = () => {
    setUser({ email: 'guest@local' });
    setAppView('dashboard');
  };

  // This effect runs once when the app starts and listens for auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      // When the auth state changes, this function is called
      setUser(currentUser); // Sets the user to the logged-in user or null
      if (!currentUser) {
        setCurrentUserProfile(null);
        setSelectedProfile(null);
        setTransactions([]);
        setTransactionError(null);
        setLoading(false);
        return;
      }

      try {
        const profile = await getOrCreateUserProfile(currentUser);
        setCurrentUserProfile(profile);
        const existingTransactions = await getUserTransactions(currentUser.uid);
        setTransactions(existingTransactions);
        setTransactionError(null);
      } catch (error) {
        console.error('Failed to load profile from database:', error);
        // Minimal fallback to keep profile UI stable.
        setCurrentUserProfile({
          uid: currentUser.uid,
          fullName: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
          username: (currentUser.email?.split('@')[0] || 'user').toLowerCase().replace(/[^a-z0-9_]/g, '_'),
          email: currentUser.email || '',
          photoURL: currentUser.photoURL || '',
          squadId: null,
          squadRole: null,
          points: { total: 0, actions: [] },
        });
        try {
          const existingTransactions = await getUserTransactions(currentUser.uid);
          setTransactions(existingTransactions);
          setTransactionError(null);
        } catch (transactionLoadError) {
          console.error('Failed to load transactions from database:', transactionLoadError);
          setTransactions([]);
          setTransactionError('Could not load your saved transactions right now.');
        }
      }
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

  const handleAddTransaction = async (transaction) => {
    if (!user?.uid) return;
    const result = await saveUserTransaction(user.uid, transaction);
    if (result.success && result.data) {
      setTransactions((prev) => [result.data, ...prev]);
      setTransactionError(null);
      return;
    }
    setTransactionError(result.error || 'Could not save transaction. Please try again.');
  };

  return (
    <>
      {user && (
        <Navbar
          user={user}
          profile={currentUserProfile}
          appView={appView}
          onChangeView={setAppView}
          onOpenProfile={() => {
            setSelectedProfile(null);
            setAppView('profile');
          }}
          onLogout={handleLogout}
        />
      )}

      {!user && <Home onMockLogin={handleMockLogin} />}

      {user && (
        appView === 'home' ? (
          <Home hideHeader={true} />
        ) : appView === 'dashboard' ? (
          <Dashboard
            user={user}
            transactions={transactions}
            onAddTransaction={handleAddTransaction}
            persistenceError={transactionError}
          />
        ) : appView === 'papertrading' ? (
          <PaperTradingApp />
        ) : appView === 'squads' ? (
          <Squads
            currentUser={user}
            currentUserProfile={currentUserProfile}
            onProfileUpdated={refreshCurrentUserProfile}
            onOpenProfile={(profile) => { setSelectedProfile(profile); setAppView('profile'); }}
            onGoToRewards={() => setAppView('rewards')}
          />
        ) : appView === 'profile' ? (
          <UserProfile
            profile={selectedProfile || currentUserProfile}
            onBack={() => setAppView(selectedProfile ? 'squads' : 'dashboard')}
          />
        ) : appView === 'rewards' ? (
          <Rewards onBack={() => setAppView('squads')} profile={currentUserProfile} />
        ) : appView === 'insights' ? (
          <Insights transactions={transactions} />
        ) : appView === 'personalization' ? (
          <Personalization
            onBack={() => setAppView('dashboard')}
          />
        ) : (
          <Dashboard
            user={user}
            transactions={transactions}
            onAddTransaction={handleAddTransaction}
            persistenceError={transactionError}
          />
        )
      )}

      <Chatbot />
    </>
  );
}

export default App;