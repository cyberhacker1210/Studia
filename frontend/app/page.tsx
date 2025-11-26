'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  CheckCircle, Clock, ShieldCheck, Zap, Gift, ArrowRight, Lock, MessageCircle, Star, Users
} from 'lucide-react';

// --- COMPOSANT: COMPTE À REBOURS ---
const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 42, seconds: 15 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const TimeBox = ({ val, label }: { val: number, label: string }) => (
    <div className="flex flex-col items-center">
      <div className="bg-slate-900 text-white font-mono text-2xl md:text-3xl font-bold w-14 h-14 md:w-16 md:h-16 flex items-center justify-center rounded-xl shadow-lg border-b-4 border-indigo-500">
        {String(val).padStart(2, '0')}
      </div>
      <span className="text-[9px] uppercase font-bold text-slate-400 mt-2 tracking-wider">{label}</span>
    </div>
  );

  return (
    <div className="flex gap-3 justify-center mb-8">
        <TimeBox val={timeLeft.hours} label="Heures" />
        <div className="text-2xl font-bold text-slate-300 mt-3">:</div>
        <TimeBox val={timeLeft.minutes} label="Min" />
        <div className="text-2xl font-bold text-slate-300 mt-3">:</div>
        <TimeBox val={timeLeft.seconds} label="Sec" />
    </div>
  );
};

// --- COMPOSANT: COMPTEUR PLACES ---
const SmartSpotsCounter = () => {
  const [spots, setSpots] = useState<number | null>(null);

  useEffect(() => {
    const savedSpots = sessionStorage.getItem('studia_beta_spots');
    let currentSpots = savedSpots ? parseInt(savedSpots) : Math.floor(Math.random() * (14 - 7 + 1)) + 7;
    setSpots(currentSpots);

    const interval = setInterval(() => {
      if (Math.random() > 0.7 && currentSpots > 2) {
        currentSpots--;
        setSpots(currentSpots);
        sessionStorage.setItem('studia_beta_spots', currentSpots.toString());
      }
    }, 45000);

    return () => clearInterval(interval);
  }, []);

  if (spots === null) return <div className="h-6 w-32 bg-slate-100 animate-pulse rounded-full mx-auto mb-6"></div>;

  return (
    <div className="flex items-center justify-center gap-2 text-indigo-600 font-bold bg-indigo-50 px-4 py-1.5 rounded-full border border-indigo-100 text-sm mb-6 mx-auto w-fit animate-in fade-in duration-700">
      <Users size={16} className="animate-pulse" />
      <span>Plus que <span className="text-red-600 font-black text-base">{spots}</span> places disponibles</span>
    </div>
  );
};

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-500 selection:text-white overflow-x-hidden">

      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-lg border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="text-2xl font-black tracking-tighter flex items-center gap-2">
            <div className="w-3 h-3 bg-indigo-600 rounded-full shadow-lg shadow-indigo-500/50"></div>
            Studia.
          </div>
          <div className="flex items-center gap-4">
            <Link href="/sign-in" className="hidden md:block text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">
              Espace Membre
            </Link>
            <Link
              href="/sign-up"
              className="bg-slate-900 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-black transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2"
            >
              Inscription
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="pt-40 pb-24 px-4 text-center max-w-5xl mx-auto relative">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-100/50 rounded-full blur-3xl -z-10 mix-blend-multiply"></div>

        <div className="relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="inline-flex items-center gap-2 bg-red-50 border border-red-100 text-red-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6 shadow-sm">
            <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
            Accès Beta : Fermeture imminente
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 leading-[1.1] tracking-tight">
            Gagne <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">3h de révisions</span><br/>
            chaque semaine.
          </h1>

          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed font-medium">
            L'IA génère tes <strong>quiz</strong>, <strong>flashcards</strong> et <strong>parcours de maîtrise</strong> en 1 clic.
            Rejoins les étudiants qui hackent leurs partiels.
          </p>

          <SmartSpotsCounter />
          <CountdownTimer />

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link
              href="/sign-up"
              className="w-full sm:w-auto bg-indigo-600 text-white text-lg font-bold px-10 py-5 rounded-2xl shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 ring-4 ring-indigo-100"
            >
              Sécuriser ma place Gratuite <ArrowRight size={20}/>
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm text-slate-500">
            <span className="flex items-center gap-1.5"><CheckCircle size={16} className="text-green-500 fill-green-50"/> Pas de CB requise</span>
            <span className="flex items-center gap-1.5"><CheckCircle size={16} className="text-green-500 fill-green-50"/> Accès instantané</span>
          </div>
        </div>
      </section>

      {/* --- VALUE STACK --- */}
      <section className="py-24 px-4 bg-slate-50 border-y border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900">Une opportunité incontournable</h2>
            <p className="text-slate-600 max-w-xl mx-auto text-lg">
                Normalement, cet arsenal coûte 49€/mois.
                Pour la phase Beta, c'est <strong className="text-indigo-600">100% gratuit</strong>, avec 3 bonus offerts.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">

            {/* PACK */}
            <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 relative overflow-hidden group hover:border-indigo-200 transition-all duration-300 hover:-translate-y-1">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <div className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1">Pack All-in-One</div>
                        <h3 className="text-3xl font-bold text-slate-900">Studia Suite (Beta)</h3>
                    </div>
                    <div className="text-right">
                        <div className="text-5xl font-black text-indigo-600 tracking-tighter">0€</div>
                        <div className="text-sm text-slate-400 line-through font-medium">499€/an</div>
                    </div>
                </div>
                <div className="space-y-5">
                    {[
                        { t: "Générateur de Quiz illimité", d: "Transforme n'importe quel cours en test." },
                        { t: "Création de Flashcards IA", d: "Mémorisation long terme garantie." },
                        { t: "Mode Parcours Scientifique", d: "Méthode Feynman + Active Recall." },
                        { t: "Professeur IA Socratique 24/7", d: "Des réponses précises, jamais de jugement." },
                    ].map((item, i) => (
                        <li key={i} className="flex items-start gap-4 text-slate-700">
                            <div className="bg-green-100 text-green-600 p-1 rounded-full mt-0.5 shrink-0"><CheckCircle size={14} strokeWidth={3}/></div>
                            <div>
                                <span className="font-bold block">{item.t}</span>
                                <span className="text-sm text-slate-500">{item.d}</span>
                            </div>
                        </li>
                    ))}
                </div>
            </div>

            {/* BONUS */}
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex gap-5 relative overflow-hidden group">
                    <div className="absolute left-0 top-0 w-1.5 h-full bg-purple-500 group-hover:w-2 transition-all"></div>
                    <div className="bg-purple-50 text-purple-600 p-4 rounded-xl h-fit shrink-0"><Gift size={28}/></div>
                    <div>
                        <div className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-1">Bonus #1 • Valeur 29€</div>
                        <h4 className="font-bold text-xl text-slate-900">Masterclass "Mémoire Absolue"</h4>
                        <p className="text-slate-500 text-sm mt-2 leading-relaxed">La méthode vidéo pour apprendre 2x plus vite sans se fatiguer.</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex gap-5 relative overflow-hidden group">
                    <div className="absolute left-0 top-0 w-1.5 h-full bg-blue-500 group-hover:w-2 transition-all"></div>
                    <div className="bg-blue-50 text-blue-600 p-4 rounded-xl h-fit shrink-0"><MessageCircle size={28}/></div>
                    <div>
                        <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Bonus #2 • Communauté VIP</div>
                        <h4 className="font-bold text-xl text-slate-900">Accès Serveur Discord</h4>
                        <p className="text-slate-500 text-sm mt-2 leading-relaxed">Rejoins l'entraide. Trouve des binômes de travail et pose tes questions directement aux fondateurs.</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex gap-5 relative overflow-hidden group">
                    <div className="absolute left-0 top-0 w-1.5 h-full bg-orange-500 group-hover:w-2 transition-all"></div>
                    <div className="bg-orange-50 text-orange-600 p-4 rounded-xl h-fit shrink-0"><Zap size={28}/></div>
                    <div>
                        <div className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-1">Bonus #3 • Valeur 19€</div>
                        <h4 className="font-bold text-xl text-slate-900">Le "Kit de Survie" PDF</h4>
                        <p className="text-slate-500 text-sm mt-2 leading-relaxed">Templates de fiches, planning de révision à imprimer et checklist anti-stress.</p>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- GUARANTEE --- */}
      <section className="py-24 px-4 text-center bg-white">
        <div className="max-w-2xl mx-auto bg-gradient-to-b from-slate-50 to-white border border-slate-100 p-10 rounded-[2.5rem] shadow-sm">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-md border border-slate-100">
                <ShieldCheck size={40} className="text-green-500" />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-slate-900">Garantie "Zéro Risque"</h2>
            <p className="text-slate-600 mb-8 leading-relaxed">
                L'inscription est gratuite. Même si tu décides de ne pas rester, <strong className="text-slate-900">tu gardes les Bonus</strong> en cadeau.
            </p>
            <Link href="/sign-up" className="inline-flex items-center gap-2 text-indigo-600 font-bold hover:text-indigo-700 hover:underline text-lg transition-all">
                Je commence mon essai gratuit <ArrowRight size={18}/>
            </Link>
        </div>
      </section>

      {/* --- FINAL CTA (CORRIGÉ : TEXTE BLANC) --- */}
      <section className="py-24 px-4 bg-slate-900 text-white text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

        <div className="max-w-3xl mx-auto relative z-10">
            <div className="flex justify-center gap-1 text-yellow-400 mb-8">
                {[1,2,3,4,5].map(i => <Star key={i} fill="currentColor" size={24}/>)}
            </div>

            {/* TEXTE BLANC ICI */}
            <h2 className="text-4xl md:text-5xl font-black mb-8 tracking-tight text-white">
                "L'outil que j'aurais rêvé avoir en Seconde."
            </h2>
            <p className="text-xl text-slate-300 mb-12 font-light">
                Arrête de perdre du temps sur des fiches inutiles.<br/>Passe à la vitesse supérieure.
            </p>

            <div className="inline-block relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-40 group-hover:opacity-70 transition duration-200"></div>
                <Link
                    href="/sign-up"
                    className="relative bg-white text-slate-900 text-xl font-bold px-12 py-6 rounded-xl flex items-center gap-3 hover:bg-slate-50 transition-all"
                >
                    Je rejoins la Beta <ArrowRight />
                </Link>
            </div>

            <div className="mt-10 flex items-center justify-center gap-2 text-sm text-slate-400 font-medium">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                12 personnes consultent cette page
            </div>
        </div>
      </section>

      {/* --- FOOTER (CORRIGÉ : LOGO ROND) --- */}
      <footer className="bg-white border-t border-slate-100 py-12">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
                {/* Logo Rond Indigo */}
                <div className="w-3 h-3 bg-indigo-600 rounded-full shadow-lg shadow-indigo-500/50"></div>
                <span className="text-slate-900 font-bold text-lg">Studia.</span>
            </div>
            <div className="text-slate-500 text-sm">
                © 2024 Studia Beta. Fait avec passion pour les étudiants.
            </div>
            <div className="flex gap-6 text-sm font-medium text-slate-600">
                <Link href="#" className="hover:text-indigo-600 transition-colors">Mentions légales</Link>
                <Link href="#" className="hover:text-indigo-600 transition-colors">Support Discord</Link>
            </div>
        </div>
      </footer>

    </main>
  );
}