'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen, Loader2, Trophy } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import QuizHistoryCard from '@/components/workspace/QuizHistoryCard';

interface QuizHistoryItem {
  id: number;
  score: number;
  total_questions: number;
  difficulty: string;
  source: string;
  created_at: string;
  quiz_id?: string;
}

export default function QuizHistoryPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [history, setHistory] = useState<QuizHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && user) {
      const load = async () => {
        // On récupère l'historique trié par date (le plus récent en premier)
        const { data } = await supabase
          .from('quiz_history')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        // On filtre les éventuelles données vides
        const validData = (data || []).filter(item => item.total_questions > 0);

        setHistory(validData);
        setLoading(false);
      };
      load();
    }
  }, [isLoaded, user]);

  const handleDelete = async (id: number) => {
    if(!confirm("Voulez-vous vraiment supprimer ce résultat ?")) return;

    try {
      await supabase.from('quiz_history').delete().eq('id', id);
      setHistory(prev => prev.filter(h => h.id !== id));
    } catch (e) {
      console.error("Erreur suppression:", e);
    }
  };

  // Calcul de la moyenne générale
  const averageScore = history.length > 0
    ? Math.round(history.reduce((acc, q) => acc + (q.score / q.total_questions * 100), 0) / history.length)
    : 0;

  if (!isLoaded || loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4 animate-pulse">
           <Loader2 className="animate-spin h-10 w-10 text-slate-900" />
           <span className="text-slate-400 font-bold text-sm uppercase tracking-widest">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-24 pt-6 px-4">

        {/* Header Navigation */}
        <button
            onClick={() => router.push('/workspace/quiz')}
            className="group flex items-center gap-3 text-slate-500 hover:text-slate-900 mb-10 font-bold text-sm transition-colors"
        >
            <div className="w-10 h-10 rounded-full border-2 border-slate-100 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all bg-white">
                <ArrowLeft size={18} />
            </div>
            Retour au Hub
        </button>

        {/* Titre & Stats */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2">Historique</h1>
                <p className="text-slate-500 font-medium">Retrouvez tous vos résultats et progressez.</p>
            </div>

            {history.length > 0 && (
                <div className="bg-slate-900 text-white px-5 py-3 rounded-2xl flex items-center gap-3 shadow-lg shadow-slate-200">
                    <Trophy size={20} className="text-yellow-400" />
                    <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Moyenne</div>
                        <div className="text-xl font-black leading-none">{averageScore}%</div>
                    </div>
                </div>
            )}
        </div>

        {/* Liste des Quiz */}
        {history.length === 0 ? (
            <div className="text-center py-20 bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem]">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <BookOpen size={32} className="text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">C'est calme ici...</h3>
                <p className="text-slate-500 mb-8">Aucun quiz effectué pour le moment.</p>
                <button onClick={() => router.push('/workspace/quiz/generate')} className="btn-b-primary">
                    Lancer un Quiz
                </button>
            </div>
        ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4">
                {history.map((item) => (
                    <QuizHistoryCard
                        key={item.id}
                        quiz={item}
                        onDelete={handleDelete}
                    />
                ))}
            </div>
        )}
    </div>
  );
}