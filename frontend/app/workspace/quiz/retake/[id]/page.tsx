'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';
import { Quiz } from '@/lib/api';
import QuizDisplay from '@/components/workspace/QuizDisplay';
import QuizResults from '@/components/workspace/QuizResults';
import { Loader2, ArrowLeft } from 'lucide-react';

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
        .eq('user_id', user.id) // Sécurité : vérifier que c'est bien son quiz
        .single();

      if (error) throw error;

      if (!data) {
        throw new Error('Quiz non trouvé');
      }

      setQuiz(data.quiz_data);
      setStep('taking');
    } catch (err: any) {
      console.error('Erreur chargement quiz:', err);
      setError(err.message);
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement du quiz...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">❌</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/workspace/quiz/history')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all"
          >
            Retour à l'historique
          </button>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Back Button */}
        <button
          onClick={() => router.push('/workspace/quiz/history')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          Retour à l'historique
        </button>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold mb-4">
            🔄 Mode Révision
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Refaites ce Quiz
          </h1>
          <p className="text-lg text-gray-600">
            Testez vos connaissances à nouveau
          </p>
        </div>

        {/* Content */}
        {step === 'taking' && (
          <QuizDisplay
            quiz={quiz}
            onComplete={handleQuizCompleted}
          />
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
    </div>
  );
}