'use client';

import { useState } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import Link from 'next/link';
import { BookOpen, LogOut, Home, Menu, X, Moon, Sun, BarChart3 } from 'lucide-react';
import { useTheme } from '@/lib/themeStore';

export default function WorkspaceNavbar() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const { isDark, toggle } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-dark-100/80 backdrop-blur-lg border-b border-gray-200 dark:border-dark-200 shadow-sm transition-colors">
        <div className="px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between">

            {/* Logo */}
            <Link
              href="/workspace"
              className="flex items-center space-x-2 active:scale-95 transition-transform"
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <BookOpen className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                  Studia
                </h1>
                <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 leading-none">
                  AI Learning
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-3">
              <Link
                href="/"
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-200 rounded-lg transition-all"
              >
                <Home size={20} />
                <span className="font-medium">Accueil</span>
              </Link>

              <Link
                href="/workspace/stats"
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-200 rounded-lg transition-all"
              >
                <BarChart3 size={20} />
                <span className="font-medium">Stats</span>
              </Link>

              {/* Theme Toggle */}
              <button
                onClick={toggle}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-200 transition-colors"
                aria-label="Toggle theme"
              >
                {isDark ? (
                  <Sun size={20} className="text-yellow-500" />
                ) : (
                  <Moon size={20} className="text-gray-600" />
                )}
              </button>

              {isLoaded && user && (
                <div className="flex items-center space-x-3 px-4 py-2 bg-gray-50 dark:bg-dark-200 rounded-lg">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {user.emailAddresses[0]?.emailAddress?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white max-w-[150px] truncate">
                    {user.emailAddresses[0]?.emailAddress?.split('@')[0]}
                  </span>
                </div>
              )}

              <button
                onClick={() => signOut({ redirectUrl: '/' })}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-all"
              >
                <LogOut size={20} />
                <span className="font-medium">Déconnexion</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 -mr-2 text-gray-700 dark:text-gray-300 active:bg-gray-100 dark:active:bg-dark-200 rounded-lg transition-colors touch-manipulation"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-dark-200 bg-white dark:bg-dark-100 shadow-lg">
            <div className="px-4 py-3 space-y-2">

              {isLoaded && user && (
                <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-md">
                    {user.emailAddresses[0]?.emailAddress?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {user.emailAddresses[0]?.emailAddress?.split('@')[0]}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                      {user.emailAddresses[0]?.emailAddress}
                    </p>
                  </div>
                </div>
              )}

              <Link
                href="/"
                className="flex items-center space-x-3 p-4 text-gray-700 dark:text-gray-300 active:bg-gray-100 dark:active:bg-dark-200 rounded-xl transition-colors touch-manipulation"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Home size={24} />
                <span className="text-base font-medium">Accueil</span>
              </Link>

              <Link
                href="/workspace/stats"
                className="flex items-center space-x-3 p-4 text-gray-700 dark:text-gray-300 active:bg-gray-100 dark:active:bg-dark-200 rounded-xl transition-colors touch-manipulation"
                onClick={() => setMobileMenuOpen(false)}
              >
                <BarChart3 size={24} />
                <span className="text-base font-medium">Statistiques</span>
              </Link>

              <button
                onClick={toggle}
                className="w-full flex items-center space-x-3 p-4 text-gray-700 dark:text-gray-300 active:bg-gray-100 dark:active:bg-dark-200 rounded-xl transition-colors touch-manipulation"
              >
                {isDark ? (
                  <>
                    <Sun size={24} className="text-yellow-500" />
                    <span className="text-base font-medium">Mode Clair</span>
                  </>
                ) : (
                  <>
                    <Moon size={24} />
                    <span className="text-base font-medium">Mode Sombre</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  signOut({ redirectUrl: '/' });
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center space-x-3 p-4 text-red-600 dark:text-red-400 active:bg-red-50 dark:active:bg-red-900/20 rounded-xl transition-colors touch-manipulation"
              >
                <LogOut size={24} />
                <span className="text-base font-medium">Déconnexion</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
}