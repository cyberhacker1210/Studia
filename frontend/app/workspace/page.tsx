'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Camera,
  FileQuestion,
  Layers,
  BookOpen,
  Sparkles,
  ArrowRight,
  BarChart3,
  Clock,
  Flame,
  TrendingUp,
  Target,
  MessageSquare,
  BrainCircuit,
  LayoutDashboard,
  Play,
  GraduationCap
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

  // --- STATE ---
  const [stats, setStats] = useState<UserStats>({
    totalQuizzes: 0,
    totalFlashcards: 0,
    totalCourses: 0,
    averageScore: 0,
    studyStreak: 0,
    lastActivity: 'Aucune activité'
  });
  const [courses, setCourses] = useState<Course[]>([]); // Pour le mode parcours
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'parcours'>('dashboard');

  // --- CHARGEMENT DES DONNÉES ---
  useEffect(() => {
    if (isLoaded && user) {
      loadAllData();
    }
  }, [isLoaded, user]);

  const loadAllData = async () => {
    if (!user) return;

    try {
      // 1. Récupérer les stats (Code d'origine)
      const { data: quizzes } = await supabase.from('quiz_history').select('score, total_questions, created_at').eq('user_id', user.id);
      const { data: decks } = await supabase.from('flashcard_decks').select('flashcards, created_at').eq('user_id', user.id);
      const { data: userCourses } = await supabase.from('courses').select('*').eq('user_id', user.id);

      const totalQuizzes = quizzes?.length || 0;
      const totalFlashcards = decks?.reduce((acc, d) => acc + d.flashcards.length, 0) || 0;
      const totalCourses = userCourses?.length || 0;

      const averageScore = quizzes?.length
        ? Math.round(quizzes.reduce((acc, q) => acc + (q.score / q.total_questions * 100), 0) / quizzes.length)
        : 0;

      const allDates = [
        ...(quizzes?.map(q => q.created_at) || []),
        ...(userCourses?.map(c => c.created_at) || [])
      ].sort().reverse();

      const lastActivity = allDates[0]
        ? new Date(allDates[0]).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
        : 'Aucune activité';

      setStats({
        totalQuizzes,
        totalFlashcards,
        totalCourses,
        averageScore,
        studyStreak: 0,
        lastActivity
      });

      // 2. Préparer les cours pour le Mode Parcours
      if (userCourses) {
          // Tri par date décroissante
          setCourses(userCourses.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
      }

    } catch (error) {
      console.error('Erreur chargement stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // --- CONFIGURATION ---
  const mainFeatures = [
    {
      id: 'capture',
      title: 'Capturer un Cours',
      description: 'Photo → Texte extrait → Sauvegardé',
      icon: Camera,
      gradient: 'from-blue-500 via-blue-600 to-indigo-600',
      bgGradient: 'from-blue-50 to-indigo-50',
      href: '/workspace/capture',
      iconColor: 'text-blue-600',
      badge: 'Action Principale',
      badgeColor: 'bg-blue-100 text-blue-700',
    },
     {
      id: 'prof-ia',
      title: 'Professeur IA',
      description: 'Tuteur Socratique Interactif',
      icon: MessageSquare,
      gradient: 'from-green-500 via-emerald-600 to-teal-600',
      bgGradient: 'from-green-50 to-emerald-50',
      href: '/workspace/chat',
      iconColor: 'text-green-600',
      badge: 'Amélioré',
      badgeColor: 'bg-green-100 text-green-700',
    },
    {
      id: 'quiz',
      title: 'Quiz Generator',
      description: 'QCM intelligents depuis vos cours',
      icon: FileQuestion,
      gradient: 'from-purple-500 via-purple-600 to-pink-600',
      bgGradient: 'from-purple-50 to-pink-50',
      href: '/workspace/quiz',
      iconColor: 'text-purple-600',
      badge: 'Populaire',
      badgeColor: 'bg-purple-100 text-purple-700',
    },
    {
      id: 'flashcards',
      title: 'Flashcards AI',
      description: 'Répétition espacée + IA',
      icon: Layers,
      gradient: 'from-pink-500 via-rose-600 to-red-600',
      bgGradient: 'from-pink-50 to-rose-50',
      href: '/workspace/flashcards',
      iconColor: 'text-pink-600',
      badge: 'Nouveau',
      badgeColor: 'bg-pink-100 text-pink-700',
    },
  ];

  const statsCards = [
    {
      label: 'Quiz',
      value: stats.totalQuizzes,
      icon: FileQuestion,
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
      label: 'Cours',
      value: stats.totalCourses,
      icon: BookOpen,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
      change: '+8',
    },
    {
      label: 'Série',
      value: `${stats.studyStreak}j`,
      icon: Flame,
      color: 'text-orange-600',
      bg: 'bg-orange-100',
      change: 'Actif',
    },
  ];

  const quickActions = [
    {
      title: 'Statistiques',
      description: 'Voir mes performances',
      icon: BarChart3,
      href: '/workspace/stats',
      color: 'from-indigo-500 to-purple-500',
      iconColor: 'text-indigo-600',
    },
    {
      title: 'Historique Quiz',
      description: 'Revoir mes quiz',
      icon: Clock,
      href: '/workspace/quiz/history',
      color: 'from-blue-500 to-cyan-500',
      iconColor: 'text-blue-600',
    },
  ];

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push('/');
    return null;
  }

  const firstName = user.firstName || user.emailAddresses[0]?.emailAddress?.split('@')[0] || 'Étudiant';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12">

        {/* --- HEADER (Commun) --- */}
        <div className="mb-8 sm:mb-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            Bonjour, <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{firstName}</span> 👋
          </h1>
          <p className="text-base sm:text-lg text-gray-600 mb-6">
            Dernière activité : {stats.lastActivity}
          </p>
        </div>

        {/* --- NAVIGATION ONGLETS --- */}
        <div className="flex justify-center mb-10 sticky top-4 z-30">
            <div className="bg-white/90 backdrop-blur-md p-1.5 rounded-2xl shadow-lg shadow-indigo-500/10 border border-white/50 inline-flex">
                <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                        activeTab === 'dashboard' 
                        ? 'bg-gray-900 text-white shadow-md scale-105' 
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                    <LayoutDashboard size={18} />
                    Vue d'ensemble
                </button>
                <button
                    onClick={() => setActiveTab('parcours')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                        activeTab === 'parcours' 
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md scale-105' 
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                    <BrainCircuit size={18} />
                    Mode Parcours
                </button>
            </div>
        </div>

        {/* ==================================================================================
            ONGLET 1 : DASHBOARD (Motivator + Stats + Features)
           ================================================================================== */}
        {activeTab === 'dashboard' && (
            <div className="animate-in slide-in-from-bottom-4 duration-500">

                {/* 💡 WIDGET MOTIVATEUR (Seulement ici) */}
                <div className="mb-8">
                  <MotivatorWidget />
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
                {statsCards.map((stat, index) => (
                    <div
                    key={index}
                    className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-4 sm:p-6 border border-gray-100 transform hover:scale-105"
                    >
                    <div className="flex items-center justify-between mb-3">
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 ${stat.bg} rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform`}>
                        <stat.icon className={stat.color} size={20} />
                        </div>
                        <span className="text-xs font-semibold text-green-600">
                        {stat.change}
                        </span>
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                        {stat.value}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600">
                        {stat.label}
                    </p>
                    </div>
                ))}
                </div>

                {/* Main Features Grid */}
                <div className="mb-8 sm:mb-12">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 flex items-center">
                    <Sparkles className="mr-3 text-yellow-500" size={28} />
                    Fonctionnalités Principales
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {mainFeatures.map((feature) => {
                    const Icon = feature.icon;
                    return (
                        <Link
                        key={feature.id}
                        href={feature.href}
                        className="group relative overflow-hidden bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 border border-gray-100"
                        >
                        {/* Background Gradient */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient} opacity-50 group-hover:opacity-70 transition-opacity`}></div>

                        {/* Content */}
                        <div className="relative z-10 p-6 sm:p-8">
                            <div className="flex items-start justify-between mb-4">
                            <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                                <Icon className="text-white" size={28} />
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${feature.badgeColor}`}>
                                {feature.badge}
                            </span>
                            </div>

                            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all">
                            {feature.title}
                            </h3>

                            <p className="text-gray-600 mb-4 text-sm sm:text-base">
                            {feature.description}
                            </p>

                            <div className="flex items-center text-blue-600 font-semibold group-hover:translate-x-2 transition-transform">
                            <span className="mr-2">Accéder</span>
                            <ArrowRight size={20} />
                            </div>
                        </div>
                        </Link>
                    );
                    })}
                </div>
                </div>

                {/* Quick Actions */}
                <div className="mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 flex items-center">
                    <Sparkles className="mr-3 text-yellow-500" size={28} />
                    Actions Rapides
                </h2>

                <div className="grid sm:grid-cols-2 gap-6">
                    {quickActions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                        <Link
                        key={index}
                        href={action.href}
                        className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100 transform hover:scale-105"
                        >
                        <div className="flex items-center space-x-4">
                            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-md`}>
                            <Icon className="text-white" size={24} />
                            </div>
                            <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 mb-1">
                                {action.title}
                            </h3>
                            <p className="text-sm text-gray-600">
                                {action.description}
                            </p>
                            </div>
                            <ArrowRight className={`${action.iconColor} group-hover:translate-x-2 transition-transform`} size={20} />
                        </div>
                        </Link>
                    );
                    })}
                </div>
                </div>

                {/* Tips Section */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl shadow-2xl p-6 sm:p-8">
                <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                    <TrendingUp className="text-white" size={24} />
                    </div>
                    <div className="flex-1">
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">
                        💡 Conseil du Jour
                    </h3>
                    <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
                        La répétition espacée est la méthode la plus efficace pour mémoriser.
                        Révisez vos flashcards régulièrement pour maximiser votre rétention !
                    </p>
                    </div>
                </div>
                </div>
            </div>
        )}


        {/* ==================================================================================
            ONGLET 2 : MODE PARCOURS
           ================================================================================== */}
        {activeTab === 'parcours' && (
            <div className="animate-in slide-in-from-bottom-4 duration-500">

                {/* Intro Banner */}
                <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-3xl shadow-2xl p-8 mb-10 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500 opacity-20 blur-3xl rounded-full -mr-20 -mt-20"></div>
                    <div className="relative z-10 max-w-3xl">
                        <div className="flex items-center gap-3 mb-4">
                            <BrainCircuit className="text-purple-300" size={32} />
                            <span className="px-3 py-1 bg-purple-500/30 rounded-full text-xs font-bold uppercase tracking-wider border border-purple-400/30">
                                Apprentissage Scientifique
                            </span>
                        </div>
                        <h2 className="text-3xl font-bold mb-4">Ne révisez plus au hasard.</h2>
                        <p className="text-indigo-100 text-lg leading-relaxed mb-6">
                            Le Mode Parcours utilise une combinaison de méthodes prouvées (Feynman, Rappel Actif, Entrelacement)
                            pour transformer vos cours en sessions interactives. L'IA vous guide pas à pas vers la maîtrise.
                        </p>
                        <div className="flex gap-4 text-sm font-medium text-purple-200">
                            <span className="flex items-center gap-1">✓ Technique Feynman</span>
                            <span className="flex items-center gap-1">✓ Active Recall</span>
                            <span className="flex items-center gap-1">✓ Interleaving</span>
                        </div>
                    </div>
                </div>

                {/* Courses Grid for Path Mode */}
                <div className="mb-8">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 flex items-center">
                        <Target className="mr-3 text-purple-600" size={28} />
                        Choisir un cours à maîtriser
                    </h2>

                    {courses.length === 0 ? (
                         <div className="text-center py-16 bg-white rounded-3xl shadow-sm border border-dashed border-gray-300">
                            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <BookOpen size={32} className="text-gray-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Votre bibliothèque est vide</h3>
                            <p className="text-gray-500 mb-6">Ajoutez un cours pour activer le mode parcours.</p>
                            <button
                                onClick={() => router.push('/workspace/capture')}
                                className="text-blue-600 font-semibold hover:underline"
                            >
                                Créer mon premier cours
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {courses.map((course) => (
                                <div
                                    key={course.id}
                                    className="group relative overflow-hidden bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 border border-gray-100 flex flex-col h-full"
                                >
                                    {/* Background Gradient Subtle */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                    {/* Badge */}
                                    <div className="absolute top-0 right-0 bg-gray-900 text-white text-[10px] font-bold px-4 py-1.5 rounded-bl-2xl uppercase tracking-widest group-hover:bg-purple-600 transition-colors z-20">
                                        Parcours IA
                                    </div>

                                    <div className="relative z-10 p-8 flex flex-col h-full">
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg text-white mb-6 group-hover:scale-110 transition-transform duration-300">
                                            <GraduationCap size={28} />
                                        </div>

                                        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
                                            {course.title}
                                        </h3>

                                        <p className="text-gray-500 mb-8 text-sm line-clamp-2 flex-grow">
                                            Lancer une session guidée pour maîtriser ce sujet en profondeur.
                                        </p>

                                        <button
                                            onClick={() => router.push(`/workspace/courses/${course.id}/mastery`)}
                                            className="w-full bg-white border-2 border-gray-100 text-gray-700 py-3 rounded-xl font-bold flex items-center justify-center gap-2 group-hover:bg-gray-900 group-hover:text-white group-hover:border-gray-900 transition-all shadow-sm"
                                        >
                                            <Play size={18} fill="currentColor" />
                                            Démarrer
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        )}

      </div>
    </div>
  );
}