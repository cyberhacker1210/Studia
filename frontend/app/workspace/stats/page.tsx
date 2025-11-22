'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import {
  Award,
  BookOpen,
  Layers,
  BarChart3,
  TrendingUp,
  Calendar,
  Flame,
  Target,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface Stats {
  totalQuizzes: number;
  totalFlashcards: number;
  totalCourses: number;
  averageScore: number;
  studyStreak: number;
  totalStudyTime: number;
  bestScore: number;
  recentActivity: any[];
}

export default function StatsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({
    totalQuizzes: 0,
    totalFlashcards: 0,
    totalCourses: 0,
    averageScore: 0,
    studyStreak: 0,
    totalStudyTime: 0,
    bestScore: 0,
    recentActivity: [],
  });
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
        .select('*')
        .eq('user_id', user.id);

      const { data: decks } = await supabase
        .from('flashcard_decks')
        .select('*')
        .eq('user_id', user.id);

      const { data: courses } = await supabase
        .from('courses')
        .select('*')
        .eq('user_id', user.id);

      const totalQuizzes = quizzes?.length || 0;
      const totalFlashcards = decks?.reduce((acc, d) => acc + d.flashcards.length, 0) || 0;
      const totalCourses = courses?.length || 0;

      const scores = quizzes?.map(q => (q.score / q.total_questions) * 100) || [];
      const averageScore = scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;

      const bestScore = scores.length > 0 ? Math.round(Math.max(...scores)) : 0;

      const recentActivity = [
        ...(quizzes?.map(q => ({
          type: 'quiz',
          date: q.created_at,
          score: (q.score / q.total_questions) * 100,
        })) || []),
      ]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10);

      setStats({
        totalQuizzes,
        totalFlashcards,
        totalCourses,
        averageScore,
        studyStreak: 0,
        totalStudyTime: 0,
        bestScore,
        recentActivity,
      });
    } catch (error) {
      console.error('Erreur:', error);
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

  const statsCards = [
    {
      label: 'Quiz Complétés',
      value: stats.totalQuizzes,
      icon: BookOpen,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
      change: '+12%',
    },
    {
      label: 'Score Moyen',
      value: `${stats.averageScore}%`,
      icon: Target,
      color: 'text-green-600',
      bg: 'bg-green-100',
      change: '+5%',
    },
    {
      label: 'Meilleur Score',
      value: `${stats.bestScore}%`,
      icon: Award,
      color: 'text-yellow-600',
      bg: 'bg-yellow-100',
      change: 'Record',
    },
    {
      label: 'Cours',
      value: stats.totalCourses,
      icon: Layers,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
      change: '+3',
    },
  ];

  const chartData = stats.recentActivity.map((activity, index) => ({
    name: `Quiz ${stats.recentActivity.length - index}`,
    score: Math.round(activity.score),
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => router.push('/workspace')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          Retour au Workspace
        </button>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            📊 Mes Statistiques
          </h1>
          <p className="text-lg text-gray-600">
            Suivez vos performances et votre progression
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 transform hover:scale-105 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center`}>
                  <stat.icon className={stat.color} size={24} />
                </div>
                <span className="text-xs font-semibold text-green-600">{stat.change}</span>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Chart */}
        {chartData.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Award className="text-gray-900 mr-3" size={28} />
              Progression des Scores
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  name="Score (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Calendar className="text-gray-900 mr-3" size={28} />
            Activité Récente
          </h2>

          {stats.recentActivity.length === 0 ? (
            <p className="text-center text-gray-600 py-8">Aucune activité récente</p>
          ) : (
            <div className="space-y-4">
              {stats.recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <BookOpen size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Quiz {index + 1}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(activity.date).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">
                      {Math.round(activity.score)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}