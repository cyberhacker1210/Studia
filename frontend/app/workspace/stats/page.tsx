'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Trophy, Target, Flame, BookOpen, Loader2 } from 'lucide-react';

interface Stats {
  totalQuizzes: number;
  totalFlashcards: number;
  totalCourses: number;
  averageScore: number;
}

export default function StatsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && user) {
      loadStats();
    }
  }, [isLoaded, user]);

  const loadStats = async () => {
    if (!user) return;

    try {
      const { data: quizzes } = await supabase
        .from('quiz_history')
        .select('score, total_questions')
        .eq('user_id', user.id);

      const { data: decks } = await supabase
        .from('flashcard_decks')
        .select('flashcards')
        .eq('user_id', user.id);

      const { data: courses } = await supabase
        .from('courses')
        .select('id')
        .eq('user_id', user.id);

      const totalQuizzes = quizzes?.length || 0;
      const totalFlashcards = decks?.reduce((acc, d) => acc + d.flashcards.length, 0) || 0;
      const totalCourses = courses?.length || 0;

      const averageScore = quizzes?.length
        ? Math.round(quizzes.reduce((acc, q) => acc + (q.score / q.total_questions * 100), 0) / quizzes.length)
        : 0;

      setStats({
        totalQuizzes,
        totalFlashcards,
        totalCourses,
        averageScore
      });

    } catch (error) {
      console.error('Erreur chargement stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-dark-50 dark:via-dark-100 dark:to-dark-200">
        <Loader2 className="animate-spin h-12 w-12 text-blue-600" />
      </div>
    );
  }

  if (!user) {
    router.push('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-dark-50 dark:via-dark-100 dark:to-dark-200 py-12 px-4">
      <div className="max-w-6xl mx-auto">

        <button
          onClick={() => router.push('/workspace')}
          className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          Retour
        </button>

        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
          📊 Statistiques
        </h1>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-dark-100 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-dark-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <Trophy className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {stats?.totalQuizzes || 0}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Quiz Complétés</p>
          </div>

          <div className="bg-white dark:bg-dark-100 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-dark-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <Target className="text-green-600 dark:text-green-400" size={24} />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {stats?.averageScore || 0}%
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Score Moyen</p>
          </div>

          <div className="bg-white dark:bg-dark-100 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-dark-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                <Flame className="text-purple-600 dark:text-purple-400" size={24} />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {stats?.totalFlashcards || 0}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Flashcards</p>
          </div>

          <div className="bg-white dark:bg-dark-100 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-dark-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-xl flex items-center justify-center">
                <BookOpen className="text-teal-600 dark:text-teal-400" size={24} />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {stats?.totalCourses || 0}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Cours</p>
          </div>
        </div>

        <div className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">🎯 Conseil</h2>
          <p className="text-blue-100">
            Utilisez la page <strong>Analytics Avancé</strong> pour des graphiques détaillés de votre progression !
          </p>
          <button
            onClick={() => router.push('/workspace/analytics')}
            className="mt-4 px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-all"
          >
            Voir Analytics Avancé →
          </button>
        </div>

      </div>
    </div>
  );
}