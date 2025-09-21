import React from 'react';
import { Bell } from 'lucide-react';

// --- COMMON NAVBAR COMPONENT ---
const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-md border-b border-gray-800/75">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-3 items-center h-16">
          {/* Left: Logo */}
          <div className="flex justify-start">
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">
              FinWise
            </div>
          </div>
          
          {/* Center: Links */}
          <div className="hidden md:flex items-center justify-center space-x-6">
            <a href="#" className="text-gray-300 hover:text-white transition-colors">Home</a>
            <a href="#" className="text-white font-medium">Dashboard</a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">Transactions</a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">Social</a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">Learn</a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">Savings</a>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center justify-end space-x-4">
            <button className="p-2 rounded-full hover:bg-gray-800 transition-colors">
              <Bell className="w-5 h-5 text-gray-400"/>
            </button>
             <div className="w-9 h-9 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm cursor-pointer">
               N
             </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
