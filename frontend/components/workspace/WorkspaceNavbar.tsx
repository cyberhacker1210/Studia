'use client';

import { useState } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import Link from 'next/link';
import { BookOpen, LogOut, Home, Menu, X, User } from 'lucide-react';

export default function WorkspaceNavbar() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile-First Navbar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between">
            {/* Logo - Optimisé Mobile */}
            <Link
              href="/workspace"
              className="flex items-center space-x-2 active:scale-95 transition-transform"
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-md">
                <BookOpen className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">Studia</h1>
                <p className="text-[10px] sm:text-xs text-gray-500 leading-none">AI Learning</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-3">
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
                  <span className="text-sm font-medium text-gray-900 max-w-[150px] truncate">
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
              className="md:hidden p-2 -mr-2 text-gray-700 active:bg-gray-100 rounded-lg transition-colors touch-manipulation"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white shadow-lg">
            <div className="px-4 py-3 space-y-2">
              {/* User Info Mobile */}
              {isLoaded && user && (
                <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-xl mb-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-md">
                    {user.emailAddresses[0]?.emailAddress?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {user.emailAddresses[0]?.emailAddress?.split('@')[0]}
                    </p>
                    <p className="text-xs text-gray-600 truncate">
                      {user.emailAddresses[0]?.emailAddress}
                    </p>
                  </div>
                </div>
              )}

              <Link
                href="/"
                className="flex items-center space-x-3 p-4 text-gray-700 active:bg-gray-100 rounded-xl transition-colors touch-manipulation"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Home size={24} />
                <span className="text-base font-medium">Accueil</span>
              </Link>

              <button
                onClick={() => {
                  signOut({ redirectUrl: '/' });
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center space-x-3 p-4 text-red-600 active:bg-red-50 rounded-xl transition-colors touch-manipulation"
              >
                <LogOut size={24} />
                <span className="text-base font-medium">Déconnexion</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Overlay pour fermer le menu */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
}