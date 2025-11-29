'use client';

import Link from 'next/link';
import { Brain, ArrowRight, Zap, Layers, Sparkles, Check } from 'lucide-react';

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col font-sans">

      {/* NAVBAR */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur border-b border-slate-100 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2 text-xl font-extrabold tracking-tight">
             <Brain size={24} className="text-slate-900" fill="black" />
             Studia.
          </div>
          <div className="flex items-center gap-4">
            <Link href="/sign-in" className="font-bold text-slate-500 hover:text-slate-900 text-sm">
              Se connecter
            </Link>
            <Link href="/sign-up" className="btn-b-primary text-sm py-2 px-4 h-10">
              S'inscrire
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-20 px-6 text-center max-w-4xl mx-auto">
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 mb-6 leading-tight tracking-tight">
              Apprenez <span className="text-blue-600">interactivement</span>.
            </h1>
            <p className="text-xl text-slate-500 font-medium mb-10 max-w-2xl mx-auto leading-relaxed">
              Studia remplace les cours passifs par des quiz et des défis interactifs générés par IA. La meilleure façon de retenir.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
              <Link href="/sign-up" className="btn-b-primary text-lg px-10">
                Commencer Gratuitement
              </Link>
              <Link href="#demo" className="btn-b-secondary text-lg px-10">
                Voir la démo
              </Link>
            </div>

            {/* VISUAL DEMO */}
            <div className="relative mx-auto max-w-3xl">
                <div className="absolute inset-0 bg-gradient-to-b from-blue-500/20 to-purple-500/20 blur-3xl -z-10 rounded-full"></div>
                <div className="bg-white border-2 border-slate-200 rounded-[2rem] shadow-2xl overflow-hidden">
                    <div className="bg-slate-50 p-4 border-b border-slate-200 flex gap-2">
                        <div className="w-3 h-3 bg-slate-300 rounded-full"></div>
                        <div className="w-3 h-3 bg-slate-300 rounded-full"></div>
                    </div>
                    <div className="p-8 md:p-12 grid md:grid-cols-2 gap-8 items-center text-left">
                         <div>
                             <div className="text-xs font-bold text-blue-600 uppercase mb-2">Génération IA</div>
                             <h3 className="text-2xl font-bold mb-2">De la photo au Quiz.</h3>
                             <p className="text-slate-500 mb-4">Uploadez votre cours. Studia crée instantanément un module interactif.</p>
                             <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                                 <Check size={16} className="text-green-500" /> Précision 99%
                             </div>
                         </div>
                         <div className="space-y-3">
                             {[1,2,3].map(i => (
                                 <div key={i} className="bg-white border-2 border-slate-100 p-3 rounded-xl flex items-center gap-3 shadow-sm animate-pulse">
                                     <div className="w-8 h-8 bg-slate-100 rounded-lg"></div>
                                     <div className="h-2 bg-slate-100 rounded w-24"></div>
                                 </div>
                             ))}
                         </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* VALUE PROPS (Grid style Brilliant) */}
      <section className="py-24 bg-slate-50 px-6 border-t border-slate-200">
          <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-3 gap-6">
                  {[
                      { title: "Compréhension Visuelle", desc: "Des flashcards claires générées automatiquement.", icon: Layers, color: "blue" },
                      { title: "Feedback Immédiat", desc: "Sachez tout de suite si vous avez compris.", icon: Zap, color: "amber" },
                      { title: "Tuteur Personnel", desc: "Posez des questions à votre cours comme à un prof.", icon: Sparkles, color: "purple" }
                  ].map((item, i) => (
                      <div key={i} className="bg-white border-2 border-slate-100 rounded-[2rem] p-8 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                          <div className={`w-16 h-16 bg-${item.color}-50 text-${item.color}-600 rounded-2xl flex items-center justify-center mb-6`}>
                              <item.icon size={32} strokeWidth={2} />
                          </div>
                          <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                          <p className="text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                      </div>
                  ))}
              </div>
          </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto py-12 bg-white border-t border-slate-100 text-center">
          <div className="font-bold text-slate-900 text-xl mb-2">Studia.</div>
          <p className="text-slate-400 text-sm">Conçu pour les esprits curieux.</p>
      </footer>
    </main>
  );
}