'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import { Home, Plus, MessageSquare, Library, BarChart3, Brain, Layers } from 'lucide-react';

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const NavItem = ({ href, icon: Icon, label }: { href: string, icon: any, label: string }) => {
    // Active si l'url commence par le href (sauf pour root /workspace)
    const isActive = href === '/workspace' ? pathname === href : pathname?.startsWith(href);

    return (
      <Link
        href={href}
        className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all duration-200 mb-1 group ${
          isActive 
            ? 'bg-slate-100 text-slate-900' 
            : 'text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-md'
        }`}
      >
        <Icon size={22} strokeWidth={isActive ? 2.5 : 2} className="transition-transform group-hover:scale-110" />
        <span>{label}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen flex bg-white font-sans selection:bg-slate-900 selection:text-white">

      {/* SIDEBAR DESKTOP */}
      <aside className="w-72 hidden md:flex flex-col border-r-2 border-slate-100 h-screen sticky top-0 p-6 bg-slate-50/50">
        <div className="px-2 mb-10 flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-lg">
              <Brain size={24} />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-slate-900">Studia.</span>
        </div>

        <nav className="flex-1 space-y-2">
            <NavItem href="/workspace" icon={Home} label="Tableau de bord" />
            <NavItem href="/workspace/courses" icon={Library} label="Mes Cours" />
            <NavItem href="/workspace/flashcards" icon={Layers} label="Flashcards" />
            <NavItem href="/workspace/stats" icon={BarChart3} label="Statistiques" />
            <NavItem href="/workspace/chat" icon={MessageSquare} label="Tuteur IA" />
        </nav>

        <div className="mt-auto pt-6 border-t-2 border-slate-200/50">
            <Link href="/workspace/capture" className="btn-b-primary w-full mb-6">
                <Plus size={20} /> Nouveau Cours
            </Link>

            <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-2xl border-2 border-slate-100 shadow-sm">
                <UserButton afterSignOutUrl="/" />
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-900">Mon Compte</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Étudiant</span>
                </div>
            </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 min-w-0 bg-white flex flex-col relative">

          {/* MOBILE HEADER */}
          <header className="md:hidden h-16 border-b-2 border-slate-100 flex items-center justify-between px-4 sticky top-0 bg-white/90 backdrop-blur-md z-40">
              <div className="font-extrabold text-xl flex items-center gap-2 text-slate-900">
                  <Brain size={24}/> Studia
              </div>
              <UserButton afterSignOutUrl="/" />
          </header>

          {/* SCROLL AREA */}
          <div className="flex-1 overflow-y-auto">
              <div className="max-w-6xl mx-auto p-4 md:p-8 lg:p-12">
                  {children}
              </div>
          </div>

          {/* MOBILE BOTTOM NAV */}
          <nav className="md:hidden h-20 border-t-2 border-slate-100 flex items-center justify-around bg-white fixed bottom-0 w-full z-50 pb-safe px-6">
              <Link href="/workspace" className="p-2 text-slate-400 hover:text-slate-900 active:text-slate-900 transition-colors"><Home size={28}/></Link>
              <Link href="/workspace/courses" className="p-2 text-slate-400 hover:text-slate-900 active:text-slate-900 transition-colors"><Library size={28}/></Link>
              <Link href="/workspace/capture" className="p-4 bg-slate-900 text-white rounded-2xl -mt-8 shadow-xl border-4 border-white"><Plus size={32}/></Link>
              <Link href="/workspace/flashcards" className="p-2 text-slate-400 hover:text-slate-900 active:text-slate-900 transition-colors"><Layers size={28}/></Link>
              <Link href="/workspace/chat" className="p-2 text-slate-400 hover:text-slate-900 active:text-slate-900 transition-colors"><MessageSquare size={28}/></Link>
          </nav>
      </main>
    </div>
  );
}