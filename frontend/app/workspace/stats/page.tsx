'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  ArrowLeft,
  Trophy,
  Target,
  Flame,
  BookOpen,
  Loader2,
  TrendingUp,
  Calendar,
  Clock,
  Award,
  Zap,
  BarChart3
} from 'lucide-react';

interface Stats {
  totalQuizzes: number;
  totalFlashcards: number;
  totalCourses: number;
  averageScore: number;
  totalQuestions: number;
  bestScore: number;
  worstScore: number;
  lastWeekQuizzes: number;
  studyStreak: number;
}

interface QuizHistory {
  id: number;
  score: number;
  total_questions: number;
  created_at: string;
}

export default function StatsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentQuizzes, setRecentQuizzes] = useState<QuizHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && user) {
      loadStats();
    }
  }, [isLoaded, user]);

  const loadStats = async () => {
    if (!user) return;

    try {
      // Charger les quiz
      const { data: quizzes } = await supabase
        .from('quiz_history')
        .select('id, score, total_questions, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Charger les flashcards
      const { data: decks } = await supabase
        .from('flashcard_decks')
        .select('flashcards')
        .eq('user_id', user.id);

      // Charger les cours
      const { data: courses } = await supabase
        .from('courses')
        .select('id')
        .eq('user_id', user.id);

      const totalQuizzes = quizzes?.length || 0;
      const totalFlashcards = decks?.reduce((acc, d) => acc + d.flashcards.length, 0) || 0;
      const totalCourses = courses?.length || 0;

      // Calculs avancés
      const scores = quizzes?.map(q => (q.score / q.total_questions) * 100) || [];
      const averageScore = scores.length
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;

      const bestScore = scores.length ? Math.round(Math.max(...scores)) : 0;
      const worstScore = scores.length ? Math.round(Math.min(...scores)) : 0;
      const totalQuestions = quizzes?.reduce((acc, q) => acc + q.total_questions, 0) || 0;

      // Quiz de la dernière semaine
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const lastWeekQuizzes = quizzes?.filter(q => new Date(q.created_at) > oneWeekAgo).length || 0;

      // Série d'étude (à implémenter avec logique de dates consécutives)
      const studyStreak = 0;

      setStats({
        totalQuizzes,
        totalFlashcards,
        totalCourses,
        averageScore,
        totalQuestions,
        bestScore,
        worstScore,
        lastWeekQuizzes,
        studyStreak,
      });

      // Garder les 10 derniers quiz
      setRecentQuizzes(quizzes?.slice(0, 10) || []);

    } catch (error) {
      console.error('Erreur chargement stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Loader2 className="animate-spin h-12 w-12 text-blue-600" />
      </div>
    );
  }

  if (!user) {
    router.push('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <button
          onClick={() => router.push('/workspace')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          Retour
        </button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            📊 Mes Statistiques
          </h1>
          <p className="text-gray-600 text-lg">
            Vue d'ensemble de vos performances
          </p>
        </div>

        {/* Stats de Base - Grid 4 colonnes */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <BarChart3 className="mr-3 text-blue-600" size={28} />
            Statistiques Générales
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-600 hover:shadow-xl transition-all transform hover:scale-105">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Trophy className="text-blue-600" size={24} />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {stats?.totalQuizzes || 0}
              </p>
              <p className="text-sm text-gray-600">Quiz Complétés</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-600 hover:shadow-xl transition-all transform hover:scale-105">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Target className="text-green-600" size={24} />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {stats?.averageScore || 0}%
              </p>
              <p className="text-sm text-gray-600">Score Moyen</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-600 hover:shadow-xl transition-all transform hover:scale-105">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Flame className="text-purple-600" size={24} />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {stats?.totalFlashcards || 0}
              </p>
              <p className="text-sm text-gray-600">Flashcards</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-teal-600 hover:shadow-xl transition-all transform hover:scale-105">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                  <BookOpen className="text-teal-600" size={24} />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {stats?.totalCourses || 0}
              </p>
              <p className="text-sm text-gray-600">Cours Sauvegardés</p>
            </div>
          </div>
        </div>

        {/* Stats Avancées */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <TrendingUp className="mr-3 text-purple-600" size={28} />
            Statistiques Avancées
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Meilleur Score */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl shadow-lg p-6 border border-yellow-200">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-14 h-14 bg-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Award className="text-white" size={28} />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Meilleur Score</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats?.bestScore || 0}%
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                🏆 Votre record personnel
              </p>
            </div>

            {/* Score le plus faible */}
            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl shadow-lg p-6 border border-red-200">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-14 h-14 bg-red-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Target className="text-white" size={28} />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Score le Plus Bas</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats?.worstScore || 0}%
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                💪 Marge de progression
              </p>
            </div>

            {/* Total Questions */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-6 border border-blue-200">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-14 h-14 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Trophy className="text-white" size={28} />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Questions Répondues</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats?.totalQuestions || 0}
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                📝 Questions au total
              </p>
            </div>

            {/* Quiz dernière semaine */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg p-6 border border-green-200">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-14 h-14 bg-green-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Calendar className="text-white" size={28} />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Cette Semaine</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats?.lastWeekQuizzes || 0}
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                📅 Quiz des 7 derniers jours
              </p>
            </div>

            {/* Série d'étude */}
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl shadow-lg p-6 border border-orange-200">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-14 h-14 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Flame className="text-white" size={28} />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Série Actuelle</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats?.studyStreak || 0}j
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                🔥 Jours consécutifs
              </p>
            </div>

            {/* Taux de réussite */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-lg p-6 border border-purple-200">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-14 h-14 bg-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Zap className="text-white" size={28} />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Taux de Réussite</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats?.averageScore && stats.averageScore >= 50 ? '✅' : '📚'}
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                {stats?.averageScore && stats.averageScore >= 70
                  ? '🎉 Excellent niveau !'
                  : stats?.averageScore && stats.averageScore >= 50
                  ? '👍 Bon niveau'
                  : '💪 Continuez à réviser'}
              </p>
            </div>
          </div>
        </div>

        {/* Historique récent */}
        {recentQuizzes.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Clock className="mr-3 text-indigo-600" size={28} />
              Activité Récente
            </h2>

            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left">Date</th>
                      <th className="px-6 py-4 text-center">Questions</th>
                      <th className="px-6 py-4 text-center">Score</th>
                      <th className="px-6 py-4 text-right">Résultat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentQuizzes.map((quiz) => {
                      const percentage = Math.round((quiz.score / quiz.total_questions) * 100);
                      const isGood = percentage >= 70;
                      const isOk = percentage >= 50;

                      return (
                        <tr key={quiz.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-gray-700">
                            {new Date(quiz.created_at).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td className="px-6 py-4 text-center text-gray-700">
                            {quiz.total_questions}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              isGood 
                                ? 'bg-green-100 text-green-700'
                                : isOk
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {quiz.score}/{quiz.total_questions}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className={`text-2xl font-bold ${
                              isGood 
                                ? 'text-green-600'
                                : isOk
                                ? 'text-orange-600'
                                : 'text-red-600'
                            }`}>
                              {percentage}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {recentQuizzes.length >= 10 && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => router.push('/workspace/quiz/history')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
                >
                  Voir tout l'historique →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Encouragement */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-2xl p-8 text-white">
          <div className="flex items-start space-x-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
              <Trophy className="text-white" size={28} />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-3">
                {stats?.averageScore && stats.averageScore >= 70
                  ? '🎉 Excellent travail !'
                  : stats?.averageScore && stats.averageScore >= 50
                  ? '💪 Continuez comme ça !'
                  : '📚 Continuez à apprendre !'}
              </h3>
              <p className="text-blue-100 leading-relaxed">
                {stats?.averageScore && stats.averageScore >= 70
                  ? 'Vous maîtrisez bien vos cours ! Continuez à maintenir ce niveau d\'excellence.'
                  : stats?.averageScore && stats.averageScore >= 50
                  ? 'Vous progressez bien ! Révisez régulièrement pour atteindre l\'excellence.'
                  : 'La régularité est la clé du succès. Révisez avec vos flashcards et refaites vos quiz !'}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}