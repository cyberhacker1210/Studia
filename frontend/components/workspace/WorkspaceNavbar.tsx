'use client';

import { useState } from 'react';
import { useUser, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { BookOpen, Home, BarChart3, Menu, X, LogOut } from 'lucide-react';
import XpBar from './XpBar'; // Assurez-vous que l'import est correct

export default function WorkspaceNavbar() {
  const { user } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = () => {
    window.location.href = '/';
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm">
      <div className="px-4 py-3 flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo */}
        <Link href="/workspace" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <BookOpen className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Studia
            </h1>
            <p className="text-[10px] sm:text-xs text-gray-500 leading-none">
              AI Learning
            </p>
          </div>
        </Link>

        {/* Desktop Navigation + XP + Profile */}
        <div className="hidden md:flex items-center space-x-4"> {/* space-x-4 espacer les éléments */}

          <Link
            href="/"
            className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all text-sm font-medium"
          >
            <Home size={18} />
            <span>Accueil</span>
          </Link>

          <Link
            href="/workspace/stats"
            className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all text-sm font-medium"
          >
            <BarChart3 size={18} />
            <span>Stats</span>
          </Link>

          {/* Zone Droite : XP + UserButton */}
          <div className="flex items-center gap-3 pl-4 border-l border-gray-200 ml-2">
            {/* Barre d'XP */}
            <XpBar />

            {/* User Button */}
            <UserButton afterSignOutUrl="/" />
          </div>

        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 -mr-2 text-gray-700 active:bg-gray-100 rounded-lg transition-all"
          aria-label="Menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="p-4 space-y-2">
            {/* XP Bar visible en mobile en haut du menu */}
            <div className="flex justify-center mb-4">
               <XpBar />
            </div>

            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
            >
              <Home size={20} />
              <span className="font-medium">Accueil</span>
            </Link>

            <Link
              href="/workspace/stats"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
            >
              <BarChart3 size={20} />
              <span className="font-medium">Statistiques</span>
            </Link>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleSignOut();
              }}
              className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-all"
            >
              <LogOut size={20} />
              <span className="font-medium">Déconnexion</span>
            </button>

            <div className="pt-4 flex items-center justify-center space-x-3 px-4 border-t border-gray-100 mt-2">
              <UserButton afterSignOutUrl="/" />
              <span className="text-sm text-gray-600 font-medium">
                {user?.firstName || user?.emailAddresses[0]?.emailAddress}
              </span>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}