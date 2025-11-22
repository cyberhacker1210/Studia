'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, LogIn } from 'lucide-react'; // J'ai retiré Sun et Moon des imports
import LanguageToggle from './LanguageToggle';
import { useLanguage } from '@/contexts/LanguageContext';
import { UserButton, useUser } from '@clerk/nextjs';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useLanguage();
  const { isSignedIn, isLoaded } = useUser();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: t.nav.home, href: '#home' },
    { name: t.nav.about, href: '#about' },
    { name: t.nav.features, href: '#features' },
    { name: t.nav.why, href: '#why' },
    { name: t.nav.creator, href: '#creator' },
  ];

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/80 backdrop-blur-md shadow-md'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-600 to-blue-400 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg md:text-xl">S</span>
            </div>
            <span className="text-xl md:text-2xl font-bold text-gray-900">
              Studia
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
              >
                {link.name}
              </Link>
            ))}

            {/* Sélecteur de langue uniquement (Plus de toggle Dark Mode ici) */}
            <LanguageToggle />

            {isLoaded && (
              <>
                {isSignedIn ? (
                  <>
                    <Link
                      href="/workspace"
                      className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    >
                      Workspace
                    </Link>
                    <UserButton afterSignOutUrl="/" />
                  </>
                ) : (
                  <>
                    <Link
                      href="/sign-in"
                      className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors font-medium"
                    >
                      <LogIn size={18} />
                      <span>Connexion</span>
                    </Link>
                    <Link
                      href="/sign-up"
                      className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-all font-medium shadow-lg hover:shadow-xl"
                    >
                      Commencer
                    </Link>
                  </>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="px-6 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="block text-gray-700 hover:text-blue-600 transition-colors font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}

            <div className="pt-3">
              <LanguageToggle />
            </div>

            {isLoaded && (
              <>
                {isSignedIn ? (
                  <>
                    <Link
                      href="/workspace"
                      className="block text-center bg-blue-100 text-blue-700 px-6 py-2.5 rounded-lg font-medium mt-4"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Workspace
                    </Link>
                    <div className="flex justify-center mt-4">
                      <UserButton afterSignOutUrl="/" />
                    </div>
                  </>
                ) : (
                  <>
                    <Link
                      href="/sign-in"
                      className="block text-center border-2 border-blue-600 text-blue-600 px-6 py-2.5 rounded-lg font-medium mt-4"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Connexion
                    </Link>
                    <Link
                      href="/sign-up"
                      className="block text-center bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-all font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Commencer
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}