

import React from 'react';
// FIX: Module '"firebase/auth"' has no exported member 'User'. Changed import from 'firebase/auth' to '@firebase/auth' to fix module resolution issues.
import type { User } from '@firebase/auth';
import { signOutUser } from '../services/firebase';
import Button from './Button';
import MenuIcon from './icons/MenuIcon';

interface HeaderProps {
  user: User;
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, toggleSidebar }) => {
  return (
    <header className="bg-slate-900/50 backdrop-blur-sm border-b border-slate-700 p-4 sticky top-0 z-30">
      <div className="container mx-auto flex justify-between items-center">
        {/* Hamburger Menu for Mobile */}
        <button onClick={toggleSidebar} className="text-slate-300 hover:text-white lg:hidden">
          <MenuIcon className="w-6 h-6" />
        </button>
        
        <div className="hidden lg:block">
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-500">
            Butter Key Management
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="font-semibold text-slate-200 hidden sm:block">{user?.displayName}</p>
            <p className="text-sm text-slate-400 hidden sm:block">{user?.email}</p>
          </div>
          {user?.photoURL && (
            <img
              src={user.photoURL}
              alt="User profile"
              className="w-10 h-10 rounded-full border-2 border-slate-600"
            />
          )}
          <Button onClick={signOutUser} variant="secondary" size="sm">
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;