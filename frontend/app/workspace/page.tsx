'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Camera, FileQuestion, Layers, BookOpen, Sparkles, ArrowRight,
  BarChart3, Clock, Target, MessageSquare, BrainCircuit,
  LayoutDashboard, Play, GraduationCap, Calendar, ChevronUp, ChevronDown, History
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
    totalQuizzes: 0, totalFlashcards: 0, totalCourses: 0, averageScore: 0, studyStreak: 0, lastActivity: '...'
  });
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'parcours'>('dashboard');
  const [showMotivator, setShowMotivator] = useState(false);

  useEffect(() => {
    if (isLoaded && user) loadAllData();
  }, [isLoaded, user]);

  const loadAllData = async () => {
    if (!user) return;
    try {
      const [quizzesRes, decksRes, coursesRes] = await Promise.all([
        supabase.from('quiz_history').select('score, total_questions, created_at').eq('user_id', user.id),
        supabase.from('flashcard_decks').select('flashcards, created_at').eq('user_id', user.id),
        supabase.from('courses').select('*').eq('user_id', user.id)
      ]);

      const quizzes = quizzesRes.data || [];
      const decks = decksRes.data || [];
      const userCourses = coursesRes.data || [];

      const totalQuizzes = quizzes.length;
      const totalFlashcards = decks.reduce((acc, d) => acc + d.flashcards.length, 0);
      const totalCourses = userCourses.length;
      const averageScore = totalQuizzes
        ? Math.round(quizzes.reduce((acc, q) => acc + (q.score / q.total_questions * 100), 0) / totalQuizzes)
        : 0;

      const sortedCourses = userCourses.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setCourses(sortedCourses);

      const allDates = [
        ...quizzes.map(q => q.created_at),
        ...sortedCourses.map(c => c.created_at)
      ].sort().reverse();

      const lastActivity = allDates[0]
        ? new Date(allDates[0]).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
        : 'Aucune activité';

      setStats({ totalQuizzes, totalFlashcards, totalCourses, averageScore, studyStreak: 0, lastActivity });

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateExamDate = async (courseId: number, dateStr: string) => {
    try {
        await supabase.from('courses').update({ exam_date: dateStr }).eq('id', courseId);
        setCourses(prev => prev.map(c => c.id === courseId ? { ...c, exam_date: dateStr } : c));
    } catch (e) { alert("Erreur sauvegarde date"); }
  };

  const getUrgency = (dateStr: string | null | undefined) => {
    if (!dateStr) return null;
    const today = new Date();
    const examDate = new Date(dateStr);
    const diffTime = examDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { color: 'bg-gray-100 text-gray-400', text: 'Terminé' };
    if (diffDays <= 3) return { color: 'bg-red-50 text-red-600 animate-pulse border-red-100', text: `🚨 J-${diffDays}` };
    if (diffDays <= 7) return { color: 'bg-orange-50 text-orange-600 border-orange-100', text: `⚠️ J-${diffDays}` };
    return { color: 'bg-green-50 text-green-600 border-green-100', text: `📅 J-${diffDays}` };
  };

  const fadeIn = "animate-in fade-in slide-in-from-bottom-4 duration-700";
  const staggerDelay = (idx: number) => ({ animationDelay: `${idx * 100}ms` });

  if (!isLoaded || loading) return <div className="h-screen flex items-center justify-center bg-gray-50"><div className="w-12 h-12 border-4 border-indigo-600 rounded-full animate-spin border-t-transparent shadow-xl"></div></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 pb-32 relative overflow-x-hidden">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div className={fadeIn}>
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-2 tracking-tight">
                    Bonjour, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">{user?.firstName}</span> 👋
                </h1>
                <p className="text-slate-500 font-medium flex items-center gap-2">
                    <Clock size={16}/> Dernière activité : {stats.lastActivity}
                </p>
            </div>

            <div className={`bg-white p-1.5 rounded-2xl shadow-sm border border-gray-200 inline-flex ${fadeIn}`} style={{animationDelay: '200ms'}}>
                <button onClick={() => setActiveTab('dashboard')} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${activeTab === 'dashboard' ? 'bg-slate-900 text-white shadow-lg scale-105' : 'text-slate-500 hover:bg-slate-50'}`}>
                    <LayoutDashboard size={18} /> Vue d'ensemble
                </button>
                <button onClick={() => setActiveTab('parcours')} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${activeTab === 'parcours' ? 'bg-indigo-600 text-white shadow-lg scale-105' : 'text-slate-500 hover:bg-slate-50'}`}>
                    <BrainCircuit size={18} /> Mode Parcours
                </button>
            </div>
        </div>

        {/* === ONGLET 1 : DASHBOARD === */}
        {activeTab === 'dashboard' && (
            <div className="space-y-10">

                {/* STATS */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { l: 'Quiz terminés', v: stats.totalQuizzes, i: FileQuestion, c: 'text-blue-600', b: 'bg-blue-50' },
                        { l: 'Score Moyen', v: `${stats.averageScore}%`, i: Target, c: 'text-green-600', b: 'bg-green-50' },
                        { l: 'Cours créés', v: stats.totalCourses, i: BookOpen, c: 'text-purple-600', b: 'bg-purple-50' },
                        { l: 'Cartes apprises', v: stats.totalFlashcards, i: Layers, c: 'text-orange-600', b: 'bg-orange-50' },
                    ].map((s, idx) => (
                        <div key={idx} className={`bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 ${fadeIn}`} style={staggerDelay(idx)}>
                            <div className={`w-10 h-10 rounded-xl ${s.b} ${s.c} flex items-center justify-center mb-3`}><s.i size={20}/></div>
                            <div className="text-2xl font-black text-slate-900">{s.v}</div>
                            <div className="text-xs font-bold uppercase text-slate-400 tracking-wider mt-1">{s.l}</div>
                        </div>
                    ))}
                </div>

                {/* OUTILS CRÉATION */}
                <div>
                    <h2 className={`text-xl font-bold text-slate-900 mb-6 flex items-center gap-2 ${fadeIn}`} style={{animationDelay: '400ms'}}>
                        <Sparkles className="text-amber-500 fill-amber-500" size={20} /> Créer & Apprendre
                    </h2>
                    <div className="grid md:grid-cols-3 gap-5">
                        {[
                            { title: "Capturer un Cours", desc: "Photo → Texte extrait", icon: Camera, href: "/workspace/capture", color: "from-blue-500 to-cyan-500" },
                            { title: "Professeur IA", desc: "Chat socratique interactif", icon: MessageSquare, href: "/workspace/chat", color: "from-emerald-500 to-teal-500" },
                            { title: "Ma Bibliothèque", desc: "Accède à tous tes cours", icon: BookOpen, href: "/workspace/courses", color: "from-violet-500 to-fuchsia-500" },
                        ].map((tool, i) => (
                            <Link key={i} href={tool.href} className={`group relative overflow-hidden bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 ${fadeIn}`} style={staggerDelay(i + 4)}>
                                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${tool.color} opacity-10 rounded-bl-full group-hover:scale-110 transition-transform`}></div>
                                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tool.color} flex items-center justify-center text-white shadow-lg mb-4`}>
                                    <tool.icon size={24}/>
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-1">{tool.title}</h3>
                                <p className="text-sm text-slate-500 font-medium">{tool.desc}</p>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* HISTORIQUE & RÉVISIONS */}
                <div className={fadeIn} style={{animationDelay: '600ms'}}>
                    <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <History className="text-indigo-500" size={20} /> Mes Révisions
                    </h2>
                    <div className="grid md:grid-cols-2 gap-5">
                        <Link href="/workspace/flashcards" className="flex items-center gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all group">
                            <div className="bg-purple-50 text-purple-600 p-3 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                <Layers size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 text-lg">Mes Decks Flashcards</h3>
                                <p className="text-slate-500 text-sm">Révise tes {stats.totalFlashcards} cartes mémorisées</p>
                            </div>
                            <ArrowRight className="ml-auto text-slate-300 group-hover:text-purple-600 transition-colors"/>
                        </Link>

                        <Link href="/workspace/quiz/history" className="flex items-center gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all group">
                            <div className="bg-blue-50 text-blue-600 p-3 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <FileQuestion size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 text-lg">Historique des Quiz</h3>
                                <p className="text-slate-500 text-sm">Consulte tes scores sur {stats.totalQuizzes} quiz</p>
                            </div>
                            <ArrowRight className="ml-auto text-slate-300 group-hover:text-blue-600 transition-colors"/>
                        </Link>
                    </div>
                </div>

            </div>
        )}

        {/* === ONGLET 2 : PARCOURS === */}
        {activeTab === 'parcours' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-slate-900 rounded-3xl p-8 mb-8 text-white relative overflow-hidden shadow-2xl">
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-3">
                            <BrainCircuit className="text-indigo-400"/>
                            <span className="text-xs font-bold bg-white/10 px-3 py-1 rounded-full uppercase tracking-widest border border-white/10">Beta Feature</span>
                        </div>
                        <h2 className="text-3xl font-bold mb-2">Mode Maîtrise Scientifique</h2>
                        <p className="text-slate-300 max-w-xl">L'IA génère un parcours optimisé (Feynman + Active Recall) pour chaque cours. Fixe une date d'examen pour activer les rappels.</p>
                    </div>
                    <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-indigo-600 to-transparent opacity-30"></div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course, idx) => {
                        const urgency = getUrgency(course.exam_date);
                        return (
                            <div key={course.id} className={`group bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-300 flex flex-col ${fadeIn}`} style={staggerDelay(idx)}>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="bg-indigo-50 text-indigo-600 p-3 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                        <GraduationCap size={24}/>
                                    </div>
                                    {urgency && <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${urgency.color}`}>{urgency.text}</span>}
                                </div>
                                <h3 className="font-bold text-slate-900 text-lg mb-1 line-clamp-1">{course.title}</h3>
                                <p className="text-xs text-slate-400 mb-6 font-medium">Ajouté le {new Date(course.created_at).toLocaleDateString()}</p>

                                <div className="mb-6 bg-slate-50 p-3 rounded-xl mb-6 border border-slate-100 group-focus-within:border-indigo-300 transition-colors">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1 mb-1">
                                        <Calendar size={10}/> Objectif Exam
                                    </label>
                                    <input
                                        type="date"
                                        className="w-full bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer"
                                        value={course.exam_date ? new Date(course.exam_date).toISOString().split('T')[0] : ''}
                                        onChange={(e) => updateExamDate(course.id, e.target.value)}
                                    />
                                </div>

                                <button
                                    onClick={() => router.push(`/workspace/courses/${course.id}/mastery`)}
                                    className="mt-auto w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200 hover:shadow-indigo-200"
                                >
                                    <Play size={16} fill="currentColor"/> Lancer la session
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        )}

      </div>

      {/* === WIDGET OBJECTIF FLOTTANT (Rouge/Orange Détaché) === */}
      {activeTab === 'dashboard' && (
          <div className="fixed bottom-8 right-6 md:right-10 z-50 flex flex-col items-end pointer-events-none">
              {/* Le contenu est cliquable (pointer-events-auto) */}
              <div className={`pointer-events-auto transition-all duration-500 ease-in-out origin-bottom-right overflow-hidden mb-4 ${
                  showMotivator 
                  ? 'max-h-[600px] opacity-100 scale-100 translate-y-0 w-[350px] md:w-[400px]' 
                  : 'max-h-0 opacity-0 scale-90 translate-y-10 w-0'
              }`}>
                  <div className="shadow-2xl rounded-3xl overflow-hidden border border-orange-100">
                      <MotivatorWidget />
                  </div>
              </div>

              {/* BOUTON FLOTTANT (Rouge/Orange) */}
              <button
                  onClick={() => setShowMotivator(!showMotivator)}
                  className={`pointer-events-auto flex items-center gap-3 px-6 py-4 rounded-full font-bold text-white shadow-[0_10px_30px_rgba(249,115,22,0.4)] transition-all duration-300 transform hover:scale-105 active:scale-95 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 border-2 border-white/20`}
              >
                  <Target size={22} className={showMotivator ? "" : "animate-pulse"} />
                  <span className="text-sm tracking-wide">Objectif du Jour</span>
                  {showMotivator ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
              </button>
          </div>
      )}

    </div>
  );
}