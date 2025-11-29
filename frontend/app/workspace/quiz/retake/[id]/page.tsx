'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';
import { Quiz } from '@/lib/api';
import QuizDisplay from '@/components/workspace/QuizDisplay';
import QuizResults from '@/components/workspace/QuizResults';
import { Loader2, ArrowLeft, AlertTriangle } from 'lucide-react';

type Step = 'loading' | 'taking' | 'results';

export default function RetakeQuizPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [step, setStep] = useState<Step>('loading');
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && user && params.id) {
      loadQuiz();
    }
  }, [isLoaded, user, params.id]);

  const loadQuiz = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('quiz_history')
        .select('quiz_data')
        .eq('id', params.id)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      if (!data || !data.quiz_data) {
        throw new Error('Données du quiz introuvables.');
      }

      let loadedQuiz = data.quiz_data;

      // 🛠️ PATCH DE COMPATIBILITÉ (CRUCIAL)
      // Cas 1 : Le quiz a été enregistré comme un simple tableau de questions (Vieux format)
      if (Array.isArray(loadedQuiz)) {
        console.log("⚠️ Format tableau détecté, conversion...");
        loadedQuiz = { questions: loadedQuiz };
      }
      // Cas 2 : Le quiz est enveloppé bizarrement (parfois ça arrive avec jsonb)
      else if (!loadedQuiz.questions && loadedQuiz.quiz_data) {
         loadedQuiz = loadedQuiz.quiz_data;
      }

      // Validation finale
      if (!loadedQuiz.questions || !Array.isArray(loadedQuiz.questions)) {
        throw new Error("Structure du quiz invalide ou corrompue.");
      }

      setQuiz(loadedQuiz as Quiz);
      setStep('taking');

    } catch (err: any) {
      console.error('Erreur chargement quiz:', err);
      setError(err.message || "Impossible de charger ce quiz.");
    }
  };

  const handleQuizCompleted = (answers: number[]) => {
    setUserAnswers(answers);
    setStep('results');
  };

  const handleRetake = () => {
    setUserAnswers([]);
    setStep('taking');
  };

  const handleNewQuiz = () => {
    router.push('/workspace/quiz/generate');
  };

  if (!isLoaded || step === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4 animate-pulse">
           <Loader2 className="animate-spin h-10 w-10 text-slate-900" />
           <span className="text-slate-400 font-bold text-sm uppercase tracking-widest">Chargement du quiz...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500 shadow-sm">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Impossible de lancer le quiz</h2>
          <p className="text-slate-500 mb-8 leading-relaxed">{error}</p>
          <button
            onClick={() => router.push('/workspace/quiz/history')}
            className="btn-b-primary"
          >
            Retour à l'historique
          </button>
        </div>
      </div>
    );
  }

  if (!quiz) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 pb-24">
      <button
        onClick={() => router.push('/workspace/quiz/history')}
        className="group flex items-center gap-3 text-slate-500 hover:text-slate-900 mb-10 font-bold text-sm transition-colors w-fit"
      >
        <div className="w-10 h-10 rounded-full border-2 border-slate-100 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
           <ArrowLeft size={18} />
        </div>
        Quitter la révision
      </button>

      {step === 'taking' && (
        <div className="animate-in fade-in slide-in-from-bottom-4">
           <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-2">
                 Mode Révision
              </div>
              <h1 className="text-3xl font-black text-slate-900">À vous de jouer !</h1>
           </div>
           <QuizDisplay quiz={quiz} onComplete={handleQuizCompleted} />
        </div>
      )}

      {step === 'results' && (
        <QuizResults
          quiz={quiz}
          userAnswers={userAnswers}
          onRetake={handleRetake}
          onNewQuiz={handleNewQuiz}
        />
      )}
    </div>
  );
}