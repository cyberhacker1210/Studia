'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Calendar, Trophy, BookOpen, Loader2 } from 'lucide-react';
import QuizHistoryCard from '@/components/workspace/QuizHistoryCard';

interface QuizHistory {
  id: number;
  quiz_data: any;
  score: number;
  total_questions: number;
  created_at: string;
}

export default function QuizHistoryPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [quizHistory, setQuizHistory] = useState<QuizHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && user) {
      loadQuizHistory();
    }
  }, [isLoaded, user]);

  const loadQuizHistory = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('quiz_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setQuizHistory(data || []);
    } catch (err: any) {
      console.error('Erreur chargement historique:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce quiz ?')) return;

    try {
      const { error } = await supabase
        .from('quiz_history')
        .delete()
        .eq('id', id);

      if (error) throw error;

      loadQuizHistory();
    } catch (err: any) {
      alert(`Erreur: ${err.message}`);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push('/');
    return null;
  }

  const totalQuizzes = quizHistory.length;
  const averageScore = totalQuizzes > 0
    ? Math.round(quizHistory.reduce((acc, q) => acc + (q.score / q.total_questions * 100), 0) / totalQuizzes)
    : 0;
  const totalQuestions = quizHistory.reduce((acc, q) => acc + q.total_questions, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/workspace/quiz')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            Retour
          </button>

          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            📚 Historique des Quiz
          </h1>
          <p className="text-gray-600 text-lg">
            Consultez vos quiz précédents et vos performances
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Quiz Complétés</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{totalQuizzes}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <BookOpen size={24} className="text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Score Moyen</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{averageScore}%</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Trophy size={24} className="text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Questions Totales</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{totalQuestions}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Calendar size={24} className="text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">❌ {error}</p>
          </div>
        )}

        {/* Quiz List */}
        {totalQuizzes === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen size={48} className="text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Aucun quiz sauvegardé
            </h3>
            <p className="text-gray-600 mb-6">
              Générez votre premier quiz pour commencer !
            </p>
            <button
              onClick={() => router.push('/workspace/quiz/generate')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all"
            >
              Générer un Quiz
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {quizHistory.map((quiz) => (
              <QuizHistoryCard
                key={quiz.id}
                quiz={quiz}
                onDelete={() => handleDelete(quiz.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}