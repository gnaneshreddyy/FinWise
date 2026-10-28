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
    { id: 'transactions', label: 'Statements' },
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
    <nav className="sticky top-0 z-50 border-b border-line/80 bg-canvas/90 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center gap-4">
          <div className="flex shrink-0 items-center">
            <button
              onClick={() => onChangeView && onChangeView('home')}
              className="text-2xl font-bold text-ink tracking-tight"
              title="Go to Home"
            >
              FinWise
            </button>
          </div>

          <div className="flex min-w-0 flex-1 items-center justify-center overflow-x-auto">
            <div className="flex items-center gap-1 rounded-xl border border-line bg-surface/70 p-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onChangeView && onChangeView(item.id)}
                  className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    appView === item.id
                      ? 'bg-accent text-accent-ink shadow-sm shadow-accent/40'
                      : 'text-ink-muted hover:bg-raised hover:text-ink'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex shrink-0 items-center justify-end gap-3">
            <button className="hidden rounded-full p-2 hover:bg-raised sm:inline-flex">
              <Bell className="w-5 h-5 text-ink-muted"/>
            </button>
            
            {user ? (
              <>
              <button
                onClick={handleLogout}
                className="hidden md:inline-flex items-center rounded-lg border border-line-strong px-3 py-1.5 text-sm font-medium text-ink hover:bg-raised hover:text-ink"
                title="Logout"
              >
                Logout
              </button>
              <div className="relative" ref={dropdownRef}>
                {/* Profile Icon Button */}
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-9 h-9 bg-accent rounded-full flex items-center justify-center text-accent-ink font-bold text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-white"
                  aria-haspopup="true"
                  aria-expanded={isDropdownOpen}
                >
                  {avatarInitial}
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-56 origin-top-right rounded-lg border border-line-strong bg-surface shadow-xl shadow-black/30 z-50"
                    role="menu"
                    aria-orientation="vertical"
                  >
                    <div className="py-1" role="none">
                      <div className="px-4 py-3 border-b border-line-strong">
                        <p className="text-sm text-ink-muted">Signed in as</p>
                        <p className="text-sm font-medium text-ink truncate">{displayName}</p>
                        <p className="text-xs text-ink-muted truncate">{user.email}</p>
                        {displayUsername && (
                          <p className="text-xs text-accent truncate">{displayUsername}</p>
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
                        className="block w-full text-left px-4 py-2 text-sm text-ink-muted hover:bg-line/50 hover:text-ink"
                        role="menuitem"
                      >
                        Profile
                      </button>
                      
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-loss hover:bg-loss/10 hover:text-loss"
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
