'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, Award, BookOpen, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import QuizHistoryCard from '@/components/workspace/QuizHistoryCard';

interface QuizHistory {
  id: number;
  quiz_id: string;
  score: number;
  total_questions: number;
  difficulty: string;
  source: string;
  created_at: string;
  answers: number[];
}

export default function QuizHistoryPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [history, setHistory] = useState<QuizHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && user) {
      loadHistory();
    }
  }, [isLoaded, user]);

  const loadHistory = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('quiz_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setHistory(data || []);
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer ce quiz ?')) return;

    try {
      const { error } = await supabase
        .from('quiz_history')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setHistory(history.filter(q => q.id !== id));
    } catch (err) {
      console.error('Erreur:', err);
      alert('Erreur lors de la suppression');
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

  const totalQuizzes = history.length;
  const averageScore = history.length > 0
    ? Math.round(history.reduce((acc, q) => acc + (q.score / q.total_questions * 100), 0) / history.length)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => router.push('/workspace')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          Retour au Workspace
        </button>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            📊 Historique des Quiz
          </h1>
          <p className="text-lg text-gray-600">
            Retrouvez tous vos quiz passés et vos performances
          </p>
        </div>

        {/* Stats Summary */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                <BookOpen size={28} className="text-blue-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{totalQuizzes}</p>
                <p className="text-sm text-gray-600">Quiz complétés</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
                <Award size={24} className="text-green-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{averageScore}%</p>
                <p className="text-sm text-gray-600">Score moyen</p>
              </div>
            </div>
          </div>
        </div>

        {/* History List */}
        {history.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100">
            <BookOpen size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Aucun quiz encore
            </h3>
            <p className="text-gray-600 mb-6">
              Commencez par générer un quiz depuis un cours !
            </p>
            <button
              onClick={() => router.push('/workspace')}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all"
            >
              Aller au Workspace
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((quiz) => (
              <QuizHistoryCard
                key={quiz.id}
                quiz={quiz}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}