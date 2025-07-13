import React from 'react';
import { LogOut, BookOpen } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <header className="bg-white shadow-md border-b border-gray-300">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="flex justify-between items-center py-5">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-blue-600 to-teal-500 p-3 rounded-lg shadow-md">
              <BookOpen className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">NoteLog</h1>
              <p className="text-sm text-gray-500 font-medium tracking-wide">Your digital note companion</p>
            </div>
          </div>

          {/* User info and logout */}
          {user && (
            <div className="flex items-center space-x-5">
              <div className="text-right">
                <p className="text-base font-semibold text-gray-900 leading-tight">{user.username}</p>
                <p className="text-xs text-gray-400 tracking-wide">{user.email}</p>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center space-x-2 px-5 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-300 text-gray-700 font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Logout"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
