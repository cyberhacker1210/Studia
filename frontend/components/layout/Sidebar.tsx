'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home, BookOpen, Layers, Crown, GraduationCap, Settings
} from 'lucide-react';
import { UserButton } from '@clerk/nextjs';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { icon: Home, label: 'Accueil', href: '/workspace' },
    { icon: BookOpen, label: 'Bibliothèque', href: '/workspace/courses' },
    { icon: Layers, label: 'Révisions', href: '/workspace/flashcards' },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen bg-white border-r border-gray-200 fixed left-0 top-0 z-50">

      {/* LOGO */}
      <div className="h-16 flex items-center px-6 border-b border-gray-100">
        <div className="flex items-center gap-2 text-xl font-bold text-gray-900 tracking-tight">
          <div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center">
            <GraduationCap size={18} />
          </div>
          Studia.
        </div>
      </div>

      {/* NAV */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-bold transition-colors ${
                isActive 
                  ? 'bg-gray-100 text-gray-900' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon size={18} strokeWidth={2.5} className={isActive ? "text-gray-900" : "text-gray-400"} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* PREMIUM & USER */}
      <div className="p-4 border-t border-gray-100 space-y-4">
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2 text-xs font-black uppercase tracking-wider text-gray-900">
                <Crown size={14} className="text-yellow-500 fill-yellow-500"/> Premium
            </div>
            <p className="text-xs text-gray-500 mb-3 leading-tight">Débloque l'accès illimité à l'IA.</p>
            <button className="w-full bg-black text-white py-2 rounded-lg text-xs font-bold hover:bg-gray-800">
                Voir les offres
            </button>
        </div>

        <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
                <UserButton afterSignOutUrl="/"/>
                <span className="text-xs font-bold text-gray-700">Mon Compte</span>
            </div>
            <Settings size={16} className="text-gray-400 cursor-pointer hover:text-gray-600"/>
        </div>
      </div>
    </aside>
  );
}