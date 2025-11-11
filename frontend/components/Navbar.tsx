'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, LogIn } from 'lucide-react';
import LanguageToggle from './LanguageToggle';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useLanguage();

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
          <Link href="#home" className="flex items-center space-x-2">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-primary-600 to-primary-400 rounded-lg flex items-center justify-center">
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
                className="text-gray-700 hover:text-primary-600 transition-colors duration-200 font-medium"
              >
                {link.name}
              </Link>
            ))}
            <LanguageToggle />

            {/* Workspace Button - NEW */}
            <Link
              href="/workspace"
              className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 transition-colors duration-200 font-medium border-2 border-primary-600 px-4 py-2 rounded-lg hover:bg-primary-50"
            >
              <LogIn size={18} />
              <span>{t.nav.workspace}</span>
            </Link>

            <Link
              href="#waitlist"
              className="bg-primary-600 text-white px-6 py-2.5 rounded-lg hover:bg-primary-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
            >
              {t.nav.joinWaitlist}
            </Link>
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
                className="block text-gray-700 hover:text-primary-600 transition-colors duration-200 font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-3">
              <LanguageToggle />
            </div>

            {/* Workspace Button Mobile - NEW */}
            <Link
              href="/workspace"
              className="flex items-center justify-center space-x-2 text-primary-600 border-2 border-primary-600 px-6 py-2.5 rounded-lg hover:bg-primary-50 transition-all duration-200 font-medium mt-4"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <LogIn size={18} />
              <span>{t.nav.workspace}</span>
            </Link>

            <Link
              href="#waitlist"
              className="block text-center bg-primary-600 text-white px-6 py-2.5 rounded-lg hover:bg-primary-700 transition-all duration-200 font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t.nav.joinWaitlist}
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}