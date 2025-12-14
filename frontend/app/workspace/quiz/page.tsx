'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';
import { PWAService } from '@/lib/pwaService';
import {
    ArrowLeft, Brain, History, Trophy, Play, Trash2, Calendar,
    CheckCircle, AlertCircle, Clock
} from 'lucide-react';
import Link from 'next/link';

export default function QuizHubPage() {
  const router = useRouter();
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [history, setHistory] = useState<any[]>([]);
  const [pendingQuizzes, setPendingQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
        loadData();
    }
  }, [user, activeTab]);

  const loadData = async () => {
      setLoading(true);
      try {
          // 1. Charger l'historique (Supabase)
          const { data } = await supabase
              .from('quiz_history')
              .select('*')
              .eq('user_id', user!.id)
              .order('created_at', { ascending: false });
          setHistory(data || []);

          // 2. Charger les quiz en attente (Local IndexedDB)
          const localQuizzes = await PWAService.getAllQuizzesOffline();
          setPendingQuizzes(localQuizzes || []);

      } catch (e) {
          console.error("Erreur chargement quiz", e);
      } finally {
          setLoading(false);
      }
  };

  const deleteHistoryItem = async (e: any, id: number) => {
      e.stopPropagation();
      if(!confirm("Supprimer ce résultat ?")) return;
      await supabase.from('quiz_history').delete().eq('id', id);
      setHistory(history.filter(h => h.id !== id));
  };

  const deletePendingQuiz = async (e: any, id: string) => {
      e.stopPropagation();
      if(!confirm("Supprimer ce quiz en attente ?")) return;
      await PWAService.deleteQuizOffline(id); // Il faudra ajouter cette méthode dans PWAService
      setPendingQuizzes(pendingQuizzes.filter(q => q.id !== id));
  };

  const startPendingQuiz = (quiz: any) => {
      // Pour lancer un quiz en attente, on peut le passer via le state ou l'URL
      // Ici, on va utiliser une astuce : le stocker en sessionStorage et rediriger vers une page "play"
      sessionStorage.setItem('current_quiz', JSON.stringify(quiz));
      router.push('/workspace/quiz/play');
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 pb-24">

      {/* Header Navigation */}
      <button onClick={() => router.push('/workspace')} className="group flex items-center gap-3 text-slate-500 hover:text-slate-900 mb-10 font-bold text-sm transition-colors w-fit">
        <div className="w-10 h-10 rounded-full border-2 border-slate-100 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all bg-white"><ArrowLeft size={18} /></div> Retour
      </button>

      {/* Titre */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-4 border border-purple-100">
           <Brain size={12} /> Entraînement
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">Quiz Center</h1>
      </div>

      {/* Bouton Nouveau Quiz */}
      <div className="mb-12">
          <Link href="/workspace/quiz/generate" className="block group relative overflow-hidden bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl hover:-translate-y-1 transition-transform">
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600 rounded-full blur-[80px] opacity-30 -mr-16 -mt-16"></div>
              <div className="relative z-10 flex justify-between items-center">
                  <div>
                      <h3 className="text-2xl font-black mb-2">Créer un nouveau Quiz</h3>
                      <p className="text-slate-400 font-medium">Testez vos connaissances sur n'importe quel cours.</p>
                  </div>
                  <div className="w-14 h-14 bg-white text-slate-900 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play size={24} fill="currentColor" />
                  </div>
              </div>
          </Link>
      </div>

      {/* Onglets */}
      <div className="flex gap-4 border-b border-slate-200 mb-8 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('pending')}
            className={`pb-3 px-4 text-sm font-bold transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === 'pending' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
              <Clock size={16}/> En attente ({pendingQuizzes.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 px-4 text-sm font-bold transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === 'history' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
              <History size={16}/> Historique ({history.length})
          </button>
      </div>

      {/* LISTE */}
      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">

          {/* VUE : EN ATTENTE */}
          {activeTab === 'pending' && (
              pendingQuizzes.length === 0 ? (
                  <div className="text-center py-16 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                      <p className="text-slate-400 font-bold">Aucun quiz sauvegardé.</p>
                  </div>
              ) : (
                  pendingQuizzes.map((quiz) => (
                      <div key={quiz.id} onClick={() => startPendingQuiz(quiz)} className="bg-white border-2 border-slate-100 p-6 rounded-[2rem] hover:border-blue-200 hover:shadow-lg transition-all cursor-pointer group flex items-center justify-between">
                          <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black text-lg">
                                  ?
                              </div>
                              <div>
                                  <h3 className="font-bold text-slate-900 text-lg">{quiz.title || "Quiz sans titre"}</h3>
                                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider flex items-center gap-2">
                                      <Clock size={12}/> Sauvegardé
                                  </p>
                              </div>
                          </div>
                          <div className="flex items-center gap-3">
                              <span className="text-sm font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                  Commencer
                              </span>
                              <button onClick={(e) => deletePendingQuiz(e, quiz.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                                  <Trash2 size={18}/>
                              </button>
                          </div>
                      </div>
                  ))
              )
          )}

          {/* VUE : HISTORIQUE */}
          {activeTab === 'history' && (
              history.length === 0 ? (
                  <div className="text-center py-16 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                      <p className="text-slate-400 font-bold">Vous n'avez pas encore terminé de quiz.</p>
                  </div>
              ) : (
                  history.map((item) => {
                      const percentage = Math.round((item.score / item.total_questions) * 100);
                      const isSuccess = percentage >= 50;

                      return (
                          <div key={item.id} onClick={() => router.push(`/workspace/quiz/retake/${item.id}`)} className="bg-white border-2 border-slate-100 p-6 rounded-[2rem] hover:border-slate-300 hover:shadow-lg transition-all cursor-pointer group flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                  <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black border-2 ${isSuccess ? 'bg-green-50 border-green-200 text-green-600' : 'bg-red-50 border-red-200 text-red-600'}`}>
                                      <span className="text-lg leading-none">{percentage}</span>
                                      <span className="text-[10px]">%</span>
                                  </div>
                                  <div>
                                      <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                                          Quiz {item.difficulty || 'Moyen'}
                                          {isSuccess ? <CheckCircle size={16} className="text-green-500"/> : <AlertCircle size={16} className="text-red-500"/>}
                                      </h3>
                                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider flex items-center gap-2">
                                          <Calendar size={12}/> {new Date(item.created_at).toLocaleDateString()}
                                      </p>
                                  </div>
                              </div>
                              <button onClick={(e) => deleteHistoryItem(e, item.id)} className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                                  <Trash2 size={20}/>
                              </button>
                          </div>
                      );
                  })
              )
          )}
      </div>
    </div>
  );
}