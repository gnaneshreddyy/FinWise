import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase';
import { getOrCreateUserProfile, getUserProfile } from './services/userProfile';
import {
  addSampleTransactions,
  clearSampleTransactions,
  deleteUserTransaction,
  getUserTransactions,
  saveUserTransaction,
  sortTransactions,
  updateUserTransaction,
} from './services/transactions';
import { generateSampleTransactions } from '../../core/finance/sampleData.js';
import { logout } from './services/authService';
import Home from './components/Home';
import Dashboard from './components/Dashboard';
import Navbar from './components/Navbar';
import Chatbot from './components/Chatbot';
import PaperTradingApp from './components/PaperTradingApp';
import Squads from './components/Squads';
import UserProfile from './components/UserProfile';
import Rewards from './components/Rewards';
import Insights from './components/Insights';
import Transactions from './components/Transactions';

function fallbackProfile(currentUser) {
  return {
    uid: currentUser.uid,
    fullName: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
    username: (currentUser.email?.split('@')[0] || 'user').toLowerCase().replace(/[^a-z0-9_]/g, '_'),
    email: currentUser.email || '',
    photoURL: currentUser.photoURL || '',
    squadId: null,
    squadRole: null,
    points: { total: 0, actions: [] },
  };
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [appView, setAppView] = useState('dashboard'); // 'home' | 'dashboard' | 'transactions' | 'papertrading' | 'squads' | 'profile' | 'rewards' | 'insights'
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [transactionError, setTransactionError] = useState(null);

  const refreshCurrentUserProfile = async () => {
    if (!user?.uid) return null;
    const profile = await getUserProfile();
    setCurrentUserProfile(profile);
    return profile;
  };

  const resetSession = () => {
    setCurrentUserProfile(null);
    setSelectedProfile(null);
    setTransactions([]);
    setTransactionError(null);
  };

  const handleLogout = async () => {
    try {
      if (auth.currentUser) await logout();
    } finally {
      setUser(null);
      resetSession();
      setAppView('dashboard');
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        resetSession();
        setLoading(false);
        return;
      }

      try {
        setCurrentUserProfile(await getOrCreateUserProfile(currentUser));
      } catch (error) {
        console.error('Failed to load profile from database:', error);
        setCurrentUserProfile(fallbackProfile(currentUser));
      }

      try {
        setTransactions(await getUserTransactions());
        setTransactionError(null);
      } catch (transactionLoadError) {
        console.error('Failed to load transactions:', transactionLoadError);
        setTransactions([]);
        setTransactionError(
          transactionLoadError?.status === 0
            ? transactionLoadError.message
            : transactionLoadError?.status === 503
              ? 'The database is unreachable right now. Your data is safe; try again in a moment.'
              : `Could not load your saved transactions: ${transactionLoadError?.message || 'unknown error'}`
        );
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas text-sm text-ink-muted">
        Loading…
      </div>
    );
  }

  // Each mutation throws on failure so the calling form can show the error inline.
  const withPersistence = (action) => async (...args) => {
    if (!user?.uid) return;
    try {
      await action(...args);
      setTransactionError(null);
    } catch (error) {
      console.error('Transaction write failed:', error);
      throw new Error(error.status === 400 ? error.message : 'Could not save your change. Please try again.');
    }
  };

  const handleAddTransaction = withPersistence(async (values) => {
    const created = await saveUserTransaction(values);
    setTransactions((prev) => sortTransactions([created, ...prev]));
  });

  const handleUpdateTransaction = withPersistence(async (id, values) => {
    const updated = await updateUserTransaction(id, values);
    setTransactions((prev) => sortTransactions(prev.map((item) => (item.id === id ? updated : item))));
  });

  const handleDeleteTransaction = withPersistence(async (id) => {
    await deleteUserTransaction(id);
    setTransactions((prev) => prev.filter((item) => item.id !== id));
  });

  const handleLoadSample = withPersistence(async () => {
    const created = await addSampleTransactions(generateSampleTransactions());
    setTransactions((prev) => sortTransactions([...created, ...prev]));
  });

  const handleClearSample = withPersistence(async () => {
    const removed = new Set(await clearSampleTransactions());
    setTransactions((prev) => prev.filter((item) => !removed.has(item.id)));
  });

  const dashboard = (
    <Dashboard
      user={user}
      profile={currentUserProfile}
      transactions={transactions}
      onAddTransaction={handleAddTransaction}
      onLoadSample={handleLoadSample}
      onClearSample={handleClearSample}
      onChangeView={setAppView}
      persistenceError={transactionError}
    />
  );

  const renderSignedInView = () => {
    switch (appView) {
      case 'home':
        return <Home hideHeader={true} onNavigate={setAppView} />;
      case 'squads':
        return (
          <Squads
            currentUser={user}
            currentUserProfile={currentUserProfile}
            onProfileUpdated={refreshCurrentUserProfile}
            onOpenProfile={(profile) => { setSelectedProfile(profile); setAppView('profile'); }}
            onGoToRewards={() => setAppView('rewards')}
          />
        );
      case 'transactions':
        return (
          <Transactions
            transactions={transactions}
            onUpdateTransaction={handleUpdateTransaction}
            onDeleteTransaction={handleDeleteTransaction}
          />
        );
      case 'profile':
        return (
          <UserProfile
            profile={selectedProfile || currentUserProfile}
            onBack={() => setAppView(selectedProfile ? 'squads' : 'dashboard')}
          />
        );
      case 'rewards':
        return <Rewards onBack={() => setAppView('squads')} profile={currentUserProfile} />;
      case 'insights':
        return <Insights transactions={transactions} />;
      default:
        return dashboard;
    }
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

      {!user && appView !== 'papertrading' && <Home onNavigate={setAppView} />}

      {appView === 'papertrading' ? (
        <PaperTradingApp onBack={() => setAppView(user ? 'dashboard' : 'home')} />
      ) : user && renderSignedInView()}

      {user && <Chatbot transactionCount={transactions.length} />}
    </>
  );
}

export default App;
