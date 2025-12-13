'use client';

import { useState } from 'react';
import { useUser, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { BookOpen, Home, BarChart3, Menu, X, LogOut, Layers, MessageSquare, Plus } from 'lucide-react';
import XpBar from './XpBar'; // ✅ Import de la barre d'XP

export default function WorkspaceNavbar() {
  const { user, isLoaded } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = () => {
    // Redirection forcée après déconnexion pour éviter les états incohérents
    window.location.href = '/';
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200 shadow-sm transition-all">
      <div className="px-4 py-3 md:px-6 flex items-center justify-between max-w-7xl mx-auto">

        {/* LOGO */}
        <Link href="/workspace" className="flex items-center space-x-3 group hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <BookOpen className="text-white" size={22} strokeWidth={2.5} />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight">
              Studia
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
              AI Learning
            </p>
          </div>
        </Link>

        {/* DESKTOP NAV */}
        <div className="hidden md:flex items-center space-x-1">

          <Link
            href="/workspace"
            className="flex items-center space-x-2 px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl transition-all font-bold text-sm hover:text-slate-900"
          >
            <Home size={18} />
            <span>Accueil</span>
          </Link>

          <Link
            href="/workspace/stats"
            className="flex items-center space-x-2 px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl transition-all font-bold text-sm hover:text-slate-900"
          >
            <BarChart3 size={18} />
            <span>Stats</span>
          </Link>

          {/* SÉPARATEUR */}
          <div className="h-6 w-px bg-slate-200 mx-2"></div>

          {/* ZONE DROITE : XP + USER */}
          <div className="flex items-center gap-4 pl-2">
            {/* Composant Gamification */}
            <XpBar />

            {/* Avatar Clerk */}
            <div className="p-0.5 bg-slate-100 rounded-full border border-slate-200 hover:border-blue-400 transition-colors cursor-pointer">
                <UserButton afterSignOutUrl="/" />
            </div>
          </div>

        </div>

        {/* MOBILE ACTIONS */}
        <div className="flex md:hidden items-center gap-3">
            {/* XP visible aussi sur mobile en haut */}
            <div className="scale-90 origin-right">
                <XpBar />
            </div>

            {/* Menu Burger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 active:bg-slate-100 rounded-lg transition-colors"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
        </div>
      </div>

      {/* MOBILE MENU DROPDOWN */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white absolute top-full left-0 w-full shadow-xl animate-in slide-in-from-top-2 z-40">
          <div className="p-4 space-y-2">

            <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl mb-4 border border-slate-100">
                <UserButton afterSignOutUrl="/" />
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-900">{user?.firstName || 'Étudiant'}</span>
                    <span className="text-xs text-slate-500 font-medium">Compte Gratuit</span>
                </div>
            </div>

            <Link
              href="/workspace"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-3 px-4 py-3 text-slate-700 active:bg-slate-100 rounded-xl transition-all font-bold"
            >
              <Home size={20} className="text-blue-600" />
              <span>Tableau de bord</span>
            </Link>

            <Link
              href="/workspace/capture"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-3 px-4 py-3 text-slate-700 active:bg-slate-100 rounded-xl transition-all font-bold"
            >
              <Plus size={20} className="text-purple-600" />
              <span>Nouveau Cours</span>
            </Link>

            <Link
              href="/workspace/stats"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-3 px-4 py-3 text-slate-700 active:bg-slate-100 rounded-xl transition-all font-bold"
            >
              <BarChart3 size={20} className="text-green-600" />
              <span>Statistiques</span>
            </Link>

            <div className="h-px bg-slate-100 my-2"></div>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleSignOut();
              }}
              className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 active:bg-red-50 rounded-xl transition-all font-bold"
            >
              <LogOut size={20} />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}