'use client';

import { useState } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import Link from 'next/link';
import { BookOpen, LogOut, Home, Menu, X } from 'lucide-react';

export default function WorkspaceNavbar() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/workspace" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
              <BookOpen className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Studia</h1>
              <p className="text-xs text-gray-500">AI Learning Platform</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/"
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
            >
              <Home size={20} />
              <span className="font-medium">Accueil</span>
            </Link>

            {isLoaded && user && (
              <div className="flex items-center space-x-3 px-4 py-2 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {user.emailAddresses[0]?.emailAddress?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {user.emailAddresses[0]?.emailAddress?.split('@')[0]}
                </span>
              </div>
            )}

            <button
              onClick={() => signOut({ redirectUrl: '/' })}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all"
            >
              <LogOut size={20} />
              <span className="font-medium">Déconnexion</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-200 pt-4 space-y-2">
            <Link
              href="/"
              className="flex items-center space-x-2 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Home size={20} />
              <span>Accueil</span>
            </Link>

            {isLoaded && user && (
              <div className="flex items-center space-x-3 px-4 py-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {user.emailAddresses[0]?.emailAddress?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {user.emailAddresses[0]?.emailAddress}
                </span>
              </div>
            )}

            <button
              onClick={() => {
                signOut({ redirectUrl: '/' });
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center space-x-2 px-4 py-3 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg"
            >
              <LogOut size={20} />
              <span>Déconnexion</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}