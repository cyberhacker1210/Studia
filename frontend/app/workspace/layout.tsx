'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import { Home, Plus, MessageSquare, Library, BarChart3, Brain, Layers } from 'lucide-react';
import EnergyBadge from '@/components/workspace/EnergyBadge';
import ReferralHandler from '@/components/workspace/ReferralHandler';
import { useSupabaseUser } from '@/lib/useSupabaseUser';

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  useSupabaseUser();

  const NavItem = ({ href, icon: Icon, label }: any) => {
    const isActive = href === '/workspace' ? pathname === href : pathname?.startsWith(href);
    return (
      <Link href={href} className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all duration-200 mb-1 group ${isActive ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-white hover:text-slate-900'}`}>
        <Icon size={22} strokeWidth={isActive ? 2.5 : 2} className="transition-transform group-hover:scale-110" />
        <span>{label}</span>
      </Link>
    );
  };

  const MobileNavItem = ({ href, icon: Icon, label }: any) => {
    const isActive = href === '/workspace' ? pathname === href : pathname?.startsWith(href);
    return (
      <Link href={href} className={`flex flex-col items-center justify-center w-full h-full active:scale-90 transition-transform ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
        <Icon size={24} strokeWidth={isActive ? 2.5 : 2} className={isActive ? "fill-blue-100" : ""} />
        <span className="text-[10px] font-bold mt-1">{label}</span>
      </Link>
    );
  };

  return (
    <div className="h-screen w-full flex bg-slate-50 font-sans overflow-hidden">
      <ReferralHandler />

      {/* SIDEBAR DESKTOP (Inchangée) */}
      <aside className="w-72 hidden md:flex flex-col border-r-2 border-slate-100 h-full bg-white flex-shrink-0">
        <div className="px-6 py-6 mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2 font-extrabold text-xl text-slate-900">
                <div className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center shadow-lg"><Brain size={18} /></div>
                Studia.
            </div>
            <EnergyBadge />
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2 scrollbar-hide">
            <nav className="space-y-2">
                <NavItem href="/workspace" icon={Home} label="Accueil" />
                <NavItem href="/workspace/courses" icon={Library} label="Cours" />
                <NavItem href="/workspace/flashcards" icon={Layers} label="Flashcards" />
                <NavItem href="/workspace/stats" icon={BarChart3} label="Stats" />
                <NavItem href="/workspace/chat" icon={MessageSquare} label="Tuteur" />
            </nav>
        </div>
        <div className="p-6 border-t-2 border-slate-50 mt-auto">
            <Link href="/workspace/capture" className="btn-b-primary w-full mb-6"><Plus size={20} /> Nouveau Cours</Link>
            <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100">
                <UserButton afterSignOutUrl="/" />
                <div className="flex flex-col overflow-hidden">
                    <span className="text-xs font-bold text-slate-900 truncate">Mon Compte</span>
                </div>
            </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col h-full relative min-w-0">

          {/* MOBILE HEADER (Transparent Blur) */}
          <header className="md:hidden h-16 flex items-center justify-between px-4 absolute top-0 left-0 w-full z-40 bg-white/80 backdrop-blur-md border-b border-slate-100/50">
              <div className="font-black text-xl flex items-center gap-2 text-slate-900 tracking-tight">
                  Studia.
              </div>
              <div className="flex items-center gap-3">
                  <EnergyBadge />
                  <UserButton afterSignOutUrl="/" />
              </div>
          </header>

          {/* SCROLL AREA */}
          <main className="flex-1 overflow-y-auto scroll-smooth bg-slate-50">
              <div className="max-w-7xl mx-auto p-4 pt-20 pb-28 md:p-8 md:pt-8">
                  {children}
              </div>
          </main>

          {/* MOBILE FAB (Floating Action Button - Twitter Style) */}
          <Link
            href="/workspace/capture"
            className="md:hidden fixed bottom-24 right-4 w-14 h-14 bg-slate-900 text-white rounded-full shadow-2xl flex items-center justify-center z-50 active:scale-90 transition-transform hover:shadow-blue-500/20"
          >
            <Plus size={28} strokeWidth={3} />
          </Link>

          {/* MOBILE BOTTOM NAV (iOS Style) */}
          <nav className="md:hidden h-[80px] bg-white border-t border-slate-100 fixed bottom-0 w-full z-40 pb-safe px-2 grid grid-cols-4 items-center justify-items-center shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
              <MobileNavItem href="/workspace" icon={Home} label="Accueil" />
              <MobileNavItem href="/workspace/courses" icon={Library} label="Cours" />
              <MobileNavItem href="/workspace/flashcards" icon={Layers} label="Révision" />
              <MobileNavItem href="/workspace/chat" icon={MessageSquare} label="Tuteur" />
          </nav>
      </div>
    </div>
  );
}