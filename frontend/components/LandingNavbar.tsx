'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Brain, Menu, X, LogIn, ArrowRight } from 'lucide-react';

export default function LandingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <nav 
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled || isMobileMenuOpen
            ? 'bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm'
            : 'bg-white/80 backdrop-blur-md border-b border-slate-100'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex justify-between items-center">
          {/* Logo */}
          <div 
            className="flex items-center gap-2 text-xl sm:text-2xl font-extrabold tracking-tight group cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
             <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-brand rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                <Brain size={20} />
             </div>
             Studia.
          </div>

          {/* Desktop Actions */}
          <div className="hidden sm:flex items-center gap-3 sm:gap-4">
            <button 
              onClick={() => scrollToSection('demo')}
              className="text-slate-500 hover:text-slate-900 font-bold text-sm mr-4 transition-colors"
            >
              Fonctionnalités
            </button>
            <Link href="/sign-in" className="font-bold text-slate-500 hover:text-slate-900 text-sm transition-colors">
              Connexion
            </Link>
            <Link href="/sign-up" className="bg-slate-900 text-white font-bold py-2 px-4 sm:py-2.5 sm:px-6 rounded-full text-xs sm:text-sm hover:bg-slate-800 transition-all shadow-lg hover:shadow-slate-200 active:scale-95">
              Commencer
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="sm:hidden p-2 text-slate-600 hover:text-slate-900 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-16 z-40 bg-white sm:hidden animate-fade-in overflow-y-auto">
          <div className="flex flex-col p-6 gap-6">
            <div className="space-y-4">
              <button 
                onClick={() => scrollToSection('demo')}
                className="w-full text-left text-lg font-bold text-slate-600 hover:text-slate-900 py-2 border-b border-slate-100"
              >
                Fonctionnalités
              </button>
              <Link 
                href="/sign-in" 
                className="flex items-center gap-2 w-full text-left text-lg font-bold text-slate-600 hover:text-slate-900 py-2 border-b border-slate-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <LogIn size={20} /> Connexion
              </Link>
            </div>

            <div className="pt-4">
              <Link 
                href="/sign-up" 
                className="flex items-center justify-center gap-2 w-full bg-slate-900 text-white font-bold py-4 rounded-xl text-lg shadow-xl active:scale-95 transition-transform"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Commencer gratuitement <ArrowRight size={20} />
              </Link>
              <p className="text-center text-slate-400 text-sm mt-4 font-medium">
                Aucune carte bancaire requise
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
