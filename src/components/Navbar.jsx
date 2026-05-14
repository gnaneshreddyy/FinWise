import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { logout } from '../services/authService';

const Navbar = ({ user, profile, appView, onChangeView, onLogout, onOpenProfile }) => {
  const displayName = profile?.fullName || user?.displayName || user?.email?.split('@')[0] || 'User';
  const displayUsername = profile?.username ? `@${profile.username}` : null;
  const avatarInitial = displayName?.charAt(0)?.toUpperCase() || 'U';
  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'transactions', label: 'Transactions' },
    { id: 'squads', label: 'Social' },
    { id: 'insights', label: 'Insights' },
    { id: 'papertrading', label: 'Paper Trading' },
  ];

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    try {
      if (onLogout) {
        await onLogout();
      } else {
        await logout();
      }
      setIsDropdownOpen(false);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-800/80 bg-gray-950/90 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center gap-4">
          <div className="flex shrink-0 items-center">
            <button
              onClick={() => onChangeView && onChangeView('home')}
              className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-500 bg-clip-text text-transparent"
              title="Go to Home"
            >
              FinWise
            </button>
          </div>

          <div className="flex min-w-0 flex-1 items-center justify-center overflow-x-auto">
            <div className="flex items-center gap-1 rounded-xl border border-gray-800 bg-gray-900/70 p-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onChangeView && onChangeView(item.id)}
                  className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    appView === item.id
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-950/40'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex shrink-0 items-center justify-end gap-3">
            <button className="hidden rounded-full p-2 hover:bg-gray-800 sm:inline-flex">
              <Bell className="w-5 h-5 text-gray-400"/>
            </button>
            
            {user ? (
              <>
              <button
                onClick={handleLogout}
                className="hidden md:inline-flex items-center rounded-lg border border-gray-700 px-3 py-1.5 text-sm font-medium text-gray-200 hover:bg-gray-800 hover:text-white"
                title="Logout"
              >
                Logout
              </button>
              <div className="relative" ref={dropdownRef}>
                {/* Profile Icon Button */}
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-white"
                  aria-haspopup="true"
                  aria-expanded={isDropdownOpen}
                >
                  {avatarInitial}
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-56 origin-top-right rounded-lg border border-gray-700 bg-gray-900 shadow-xl shadow-black/30 z-50"
                    role="menu"
                    aria-orientation="vertical"
                  >
                    <div className="py-1" role="none">
                      <div className="px-4 py-3 border-b border-gray-700">
                        <p className="text-sm text-gray-400">Signed in as</p>
                        <p className="text-sm font-medium text-white truncate">{displayName}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                        {displayUsername && (
                          <p className="text-xs text-blue-300 truncate">{displayUsername}</p>
                        )}
                      </div>
                      
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          if (onOpenProfile) {
                            onOpenProfile();
                          } else if (onChangeView) {
                            onChangeView('profile');
                          }
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700/50 hover:text-white"
                        role="menuitem"
                      >
                        Profile
                      </button>
                      
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300"
                        role="menuitem"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
