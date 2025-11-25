'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Camera, FileQuestion, Layers, BookOpen, Sparkles, ArrowRight,
  BarChart3, Clock, Flame, Target, MessageSquare, BrainCircuit,
  LayoutDashboard, Play, GraduationCap, Calendar, BellRing
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getUserCourses, Course } from '@/lib/courseService';
import MotivatorWidget from '@/components/workspace/MotivatorWidget';

interface UserStats {
  totalQuizzes: number;
  totalFlashcards: number;
  totalCourses: number;
  averageScore: number;
  studyStreak: number;
  lastActivity: string;
}

export default function WorkspacePage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const [stats, setStats] = useState<UserStats>({
    totalQuizzes: 0, totalFlashcards: 0, totalCourses: 0, averageScore: 0, studyStreak: 0, lastActivity: 'Aucune activité'
  });
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'parcours'>('dashboard');

  useEffect(() => {
    if (isLoaded && user) {
      loadAllData();
    }
  }, [isLoaded, user]);

  const loadAllData = async () => {
    if (!user) return;
    try {
      const { data: quizzes } = await supabase.from('quiz_history').select('score, total_questions, created_at').eq('user_id', user.id);
      const { data: decks } = await supabase.from('flashcard_decks').select('flashcards, created_at').eq('user_id', user.id);
      const { data: userCourses } = await supabase.from('courses').select('*').eq('user_id', user.id);

      const totalQuizzes = quizzes?.length || 0;
      const totalFlashcards = decks?.reduce((acc, d) => acc + d.flashcards.length, 0) || 0;
      const totalCourses = userCourses?.length || 0;
      const averageScore = quizzes?.length
        ? Math.round(quizzes.reduce((acc, q) => acc + (q.score / q.total_questions * 100), 0) / quizzes.length)
        : 0;

      if (userCourses) {
          setCourses(userCourses.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
      }

      const allDates = [
        ...(quizzes?.map(q => q.created_at) || []),
        ...(userCourses?.map(c => c.created_at) || [])
      ].sort().reverse();

      const lastActivity = allDates[0]
        ? new Date(allDates[0]).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
        : 'Aucune activité';

      setStats({
        totalQuizzes, totalFlashcards, totalCourses, averageScore, studyStreak: 0, lastActivity
      });

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // --- GESTION DATE EXAMEN ---
  const updateExamDate = async (courseId: number, dateStr: string) => {
    try {
        const { error } = await supabase
            .from('courses')
            .update({ exam_date: dateStr })
            .eq('id', courseId);

        if (error) throw error;

        setCourses(prev => prev.map(c => c.id === courseId ? { ...c, exam_date: dateStr } : c));
    } catch (e) {
        console.error("Erreur date:", e);
        alert("Erreur lors de la sauvegarde de la date.");
    }
  };

  // ✅ CORRECTION ICI : Ajout de `| undefined` au type du paramètre
  const getUrgency = (dateStr: string | null | undefined) => {
    if (!dateStr) return null;
    const today = new Date();
    const examDate = new Date(dateStr);
    const diffTime = examDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { color: 'bg-gray-100 text-gray-400', text: 'Terminé' };
    if (diffDays <= 3) return { color: 'bg-red-100 text-red-600 animate-pulse', text: `🚨 J-${diffDays}` };
    if (diffDays <= 7) return { color: 'bg-orange-100 text-orange-600', text: `⚠️ J-${diffDays}` };
    return { color: 'bg-green-100 text-green-600', text: `📅 J-${diffDays}` };
  };

  if (!isLoaded || loading) return <div className="h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bonjour, <span className="text-blue-600">{user?.firstName}</span> 👋
          </h1>
          {/* Widget uniquement visible sur le dashboard */}
          {activeTab === 'dashboard' && (
             <div className="mt-6">
                <MotivatorWidget />
             </div>
          )}
        </div>

        {/* TABS */}
        <div className="flex justify-center mb-8 sticky top-4 z-30">
            <div className="bg-white p-1 rounded-xl shadow-md border border-gray-200 inline-flex">
                <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'dashboard' ? 'bg-gray-900 text-white shadow' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                    Vue d'ensemble
                </button>
                <button
                    onClick={() => setActiveTab('parcours')}
                    className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'parcours' ? 'bg-indigo-600 text-white shadow' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                    Mode Parcours
                </button>
            </div>
        </div>

        {/* ONGLET 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
            <div className="animate-in slide-in-from-bottom-2">
                {/* STATS */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                        <div className="text-gray-500 text-xs font-bold uppercase mb-1">Quiz</div>
                        <div className="text-2xl font-bold text-gray-900">{stats.totalQuizzes}</div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                        <div className="text-gray-500 text-xs font-bold uppercase mb-1">Moyenne</div>
                        <div className="text-2xl font-bold text-green-600">{stats.averageScore}%</div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                        <div className="text-gray-500 text-xs font-bold uppercase mb-1">Cours</div>
                        <div className="text-2xl font-bold text-blue-600">{stats.totalCourses}</div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                        <div className="text-gray-500 text-xs font-bold uppercase mb-1">Flashcards</div>
                        <div className="text-2xl font-bold text-purple-600">{stats.totalFlashcards}</div>
                    </div>
                </div>

                {/* ACCÈS RAPIDE */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <Link href="/workspace/capture" className="bg-blue-600 text-white p-6 rounded-2xl shadow-lg hover:bg-blue-700 transition-colors flex flex-col justify-between h-32">
                        <Camera size={24} />
                        <div>
                            <h3 className="font-bold text-lg">Nouveau Cours</h3>
                            <p className="text-blue-100 text-xs">Photo ou Upload</p>
                        </div>
                    </Link>
                    <Link href="/workspace/chat" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-green-300 transition-colors flex flex-col justify-between h-32 group">
                        <div className="bg-green-100 w-10 h-10 rounded-lg flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform"><MessageSquare size={20}/></div>
                        <div>
                            <h3 className="font-bold text-gray-900">Professeur IA</h3>
                            <p className="text-gray-500 text-xs">Posez vos questions</p>
                        </div>
                    </Link>
                    <Link href="/workspace/courses" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-purple-300 transition-colors flex flex-col justify-between h-32 group">
                        <div className="bg-purple-100 w-10 h-10 rounded-lg flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform"><BookOpen size={20}/></div>
                        <div>
                            <h3 className="font-bold text-gray-900">Bibliothèque</h3>
                            <p className="text-gray-500 text-xs">Tous vos cours</p>
                        </div>
                    </Link>
                </div>
            </div>
        )}

        {/* ONGLET 2: MODE PARCOURS */}
        {activeTab === 'parcours' && (
            <div className="animate-in slide-in-from-bottom-2">
                <div className="mb-6 bg-indigo-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2"><BrainCircuit/> Mode Maîtrise</h2>
                        <p className="text-indigo-200 max-w-lg">Sélectionnez un cours pour lancer une session guidée (Feynman + Rappel Actif).</p>
                    </div>
                    <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-purple-600 to-transparent opacity-30"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map(course => {
                        const urgency = getUrgency(course.exam_date);
                        return (
                            <div key={course.id} className="group bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-xl hover:border-indigo-200 transition-all flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="bg-indigo-50 w-12 h-12 rounded-xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                                        <GraduationCap size={24}/>
                                    </div>
                                    {urgency && (
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${urgency.color}`}>
                                            {urgency.text}
                                        </span>
                                    )}
                                </div>

                                <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{course.title}</h3>
                                <p className="text-xs text-gray-400 mb-4">Ajouté le {new Date(course.created_at).toLocaleDateString()}</p>

                                {/* DATE SELECTOR */}
                                <div className="mb-4 bg-gray-50 p-2 rounded-lg">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Objectif</label>
                                    <input
                                        type="date"
                                        className="w-full bg-transparent text-sm font-medium text-gray-700 outline-none"
                                        value={course.exam_date ? new Date(course.exam_date).toISOString().split('T')[0] : ''}
                                        onChange={(e) => updateExamDate(course.id, e.target.value)}
                                    />
                                </div>

                                <button
                                    onClick={() => router.push(`/workspace/courses/${course.id}/mastery`)}
                                    className="mt-auto w-full bg-gray-900 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 group-hover:bg-indigo-600 transition-colors"
                                >
                                    <Play size={16} fill="currentColor"/> Lancer Session
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        )}

      </div>
    </div>
  );
}