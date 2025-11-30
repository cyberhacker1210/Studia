'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home, BookOpen, Layers, Crown, Settings, BarChart3, MessageSquare, Brain
} from 'lucide-react';
import { UserButton } from '@clerk/nextjs';
import EnergyBadge from '@/components/workspace/EnergyBadge';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { icon: Home, label: 'Tableau de bord', href: '/workspace', color: 'text-brand-600' },
    { icon: BookOpen, label: 'Mes Cours', href: '/workspace/courses', color: 'text-accent-purple' },
    { icon: Layers, label: 'Flashcards', href: '/workspace/flashcards', color: 'text-accent-pink' },
    { icon: BarChart3, label: 'Statistiques', href: '/workspace/stats', color: 'text-accent-teal' },
    { icon: MessageSquare, label: 'Tuteur IA', href: '/workspace/chat', color: 'text-accent-yellow' },
  ];

  return (
    <aside className="hidden md:flex flex-col w-72 h-screen bg-white border-r-2 border-slate-100 fixed left-0 top-0 z-50 overflow-y-auto">

      {/* HEADER */}
      <div className="h-24 flex items-center justify-between px-6">
        <div className="flex items-center gap-2 text-xl font-extrabold text-slate-900 tracking-tight group cursor-pointer">
          <div className="w-10 h-10 bg-gradient-brand text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
            <Brain size={22} />
          </div>
          Studia.
        </div>
        <EnergyBadge />
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          const isActive = item.href === '/workspace'
            ? pathname === item.href
            : pathname?.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-4 px-5 py-4 rounded-2xl font-bold text-sm transition-all duration-200 ${
                isActive 
                  ? 'bg-gradient-brand text-white shadow-lg shadow-blue-200 scale-[1.02]' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon
                size={20}
                strokeWidth={isActive ? 2.5 : 2}
                className={`transition-transform duration-300 ${isActive ? 'text-white' : `${item.color} group-hover:scale-110`}`}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* FOOTER */}
      <div className="p-6 mt-auto space-y-6">

        {/* Carte Premium Brillante */}
        <div className="bg-slate-900 rounded-[1.5rem] p-6 text-white relative overflow-hidden group shadow-xl shadow-slate-200 cursor-pointer transition-transform hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl group-hover:bg-white/20 transition-all duration-500"></div>

            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3 text-xs font-black uppercase tracking-widest text-accent-yellow">
                    <Crown size={14} fill="currentColor" className="animate-bounce-slow"/> Premium
                </div>
                <p className="text-xs text-slate-300 mb-5 font-medium leading-relaxed">
                    Débloquez l'IA illimitée.
                </p>

                <Link
                  href="/workspace/pricing"
                  className="block w-full bg-white text-slate-900 py-3 rounded-xl text-xs font-bold hover:bg-blue-50 transition-colors text-center shadow-sm"
                >
                    Voir les offres
                </Link>
            </div>
        </div>

        {/* User Profile */}
        <div className="flex items-center justify-between px-2 pt-4 border-t-2 border-slate-100">
            <div className="flex items-center gap-3">
                <div className="p-0.5 bg-white border-2 border-slate-100 rounded-full hover:border-blue-400 transition-colors">
                   <UserButton afterSignOutUrl="/"/>
                </div>
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-900">Mon Compte</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gratuit</span>
                </div>
            </div>
            <button className="text-slate-300 hover:text-slate-600 transition-colors">
                <Settings size={18} />
            </button>
        </div>
      </div>
    </aside>
  );
}