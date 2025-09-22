import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

const Navbar = ({ user, appView, onChangeView, onLogout }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    try {
      if (onLogout) {
        await onLogout();
      } else {
        await signOut(auth);
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
    <nav className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-md border-b border-gray-800/75">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-3 items-center h-16">
          {/* Left: Logo */}
          <div className="flex justify-start">
            <button
              onClick={() => onChangeView && onChangeView('home')}
              className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-500 bg-clip-text text-transparent"
              title="Go to Home"
            >
              FinWise
            </button>
          </div>
          
          {/* Center: Links */}
          <div className="hidden md:flex items-center justify-center space-x-6">
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); onChangeView && onChangeView('home'); }}
              className="text-gray-300 hover:text-white transition-colors"
            >
              Home
            </a>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); onChangeView && onChangeView('dashboard'); }}
              className={`transition-colors ${appView === 'dashboard' ? 'text-white font-medium' : 'text-gray-300 hover:text-white'}`}
            >
              Dashboard
            </a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">Transactions</a>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); onChangeView && onChangeView('squads'); }}
              className={`transition-colors ${appView === 'squads' ? 'text-white font-medium' : 'text-gray-300 hover:text-white'}`}
            >
              Social
            </a>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); onChangeView && onChangeView('papertrading'); }}
              className={`transition-colors ${appView === 'papertrading' ? 'text-white font-medium' : 'text-gray-300 hover:text-white'}`}
            >
              PaperTrading
            </a>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); onChangeView && onChangeView('rewards'); }}
              className={`transition-colors ${appView === 'rewards' ? 'text-white font-medium' : 'text-gray-300 hover:text-white'}`}
            >
              Rewards
            </a>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center justify-end space-x-4">
            <button className="p-2 rounded-full hover:bg-gray-800 transition-colors">
              <Bell className="w-5 h-5 text-gray-400"/>
            </button>
            
            {user ? (
              <>
              <button
                onClick={handleLogout}
                className="hidden md:inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium text-gray-200 hover:text-white hover:bg-gray-800 border border-gray-700"
                title="Logout"
              >
                Logout
              </button>
              <div className="relative" ref={dropdownRef}>
                {/* Profile Icon Button */}
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-9 h-9 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-white"
                  aria-haspopup="true"
                  aria-expanded={isDropdownOpen}
                >
                  {user.email?.charAt(0).toUpperCase() || 'U'}
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-56 origin-top-right bg-gray-800 rounded-md shadow-lg z-50 border border-gray-700"
                    role="menu"
                    aria-orientation="vertical"
                  >
                    <div className="py-1" role="none">
                      <div className="px-4 py-3 border-b border-gray-700">
                        <p className="text-sm text-gray-400">Signed in as</p>
                        <p className="text-sm font-medium text-white truncate">{user.email}</p>
                      </div>
                      
                      {/* --- ADDED PROFILE LINK --- */}
                      <a
                        href="/profile" // Change this to your actual profile page route
                        className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700/50 hover:text-white"
                        role="menuitem"
                      >
                        Profile
                      </a>
                      
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