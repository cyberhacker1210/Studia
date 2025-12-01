'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles, History, Trophy, Brain, ArrowRight } from 'lucide-react';

export default function QuizHubPage() {
  const router = useRouter();

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 pb-24">

      {/* Header Navigation */}
      <button
        onClick={() => router.push('/workspace')}
        className="group flex items-center gap-3 text-slate-500 hover:text-slate-900 mb-10 font-bold text-sm transition-colors w-fit"
      >
        <div className="w-10 h-10 rounded-full border-2 border-slate-100 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all bg-slate-50">
          <ArrowLeft size={18} />
        </div>
        Retour au Tableau de bord
      </button>

      {/* Titre */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-4 border border-purple-100">
           <Brain size={12} /> Entraînement IA
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">Quiz Center</h1>
        <p className="text-lg text-slate-500 font-medium max-w-lg mx-auto">
           Testez vos connaissances, défiez l'IA et suivez votre progression.
        </p>
      </div>

      {/* GRILLE D'ACTIONS */}
      <div className="grid md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4">

        {/* CARTE 1 : CRÉER UN QUIZ */}
        <button
          onClick={() => router.push('/workspace/quiz/generate')}
          className="group relative bg-white border-2 border-slate-100 hover:border-blue-500 rounded-[2.5rem] p-8 text-left transition-all duration-300 hover:shadow-xl hover:-translate-y-1 active:scale-95 overflow-hidden"
        >
          {/* Décoration d'arrière-plan */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500"></div>

          <div className="relative z-10">
             <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
                <Sparkles size={32} />
             </div>

             <h3 className="text-2xl font-extrabold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                Nouveau Quiz
             </h3>
             <p className="text-slate-500 font-medium leading-relaxed mb-6">
                Générez des questions uniques à partir de n'importe quel cours grâce à l'IA.
             </p>

             <div className="inline-flex items-center text-sm font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-xl group-hover:bg-blue-100 transition-colors gap-2">
                Lancer le générateur <ArrowRight size={16} />
             </div>
          </div>
        </button>

        {/* CARTE 2 : HISTORIQUE */}
        <button
          onClick={() => router.push('/workspace/quiz/history')}
          className="group relative bg-white border-2 border-slate-100 hover:border-purple-500 rounded-[2.5rem] p-8 text-left transition-all duration-300 hover:shadow-xl hover:-translate-y-1 active:scale-95 overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500"></div>

          <div className="relative z-10">
             <div className="w-16 h-16 bg-purple-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-200 group-hover:scale-110 transition-transform">
                <History size={32} />
             </div>

             <h3 className="text-2xl font-extrabold text-slate-900 mb-2 group-hover:text-purple-600 transition-colors">
                Mon Historique
             </h3>
             <p className="text-slate-500 font-medium leading-relaxed mb-6">
                Retrouvez tous vos anciens résultats, analysez vos scores et refaites les quiz.
             </p>

             <div className="inline-flex items-center text-sm font-bold text-purple-600 bg-purple-50 px-4 py-2 rounded-xl group-hover:bg-purple-100 transition-colors gap-2">
                Voir mes stats <ArrowRight size={16} />
             </div>
          </div>
        </button>

      </div>

      {/* BANDEAU SCORE */}
      <div className="mt-12 bg-slate-900 rounded-[2rem] p-8 flex items-center justify-between text-white shadow-2xl shadow-slate-200 animate-in slide-in-from-bottom-8">
          <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-slate-900">
                  <Trophy size={24} strokeWidth={3} />
              </div>
              <div>
                  <div className="font-black text-xl">Continuez comme ça !</div>
                  <div className="text-slate-400 text-sm font-medium">Chaque quiz vous rend plus intelligent.</div>
              </div>
          </div>
      </div>

    </div>
  );
}