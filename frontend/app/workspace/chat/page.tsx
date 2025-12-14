'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { getUserCourses, Course } from '@/lib/courseService';
import CourseChat from '@/components/workspace/CourseChat';
import { MessageSquare, BookOpen, ArrowLeft, Loader2, Bot, Sparkles } from 'lucide-react';

export default function ChatPage() {
  const { user } = useUser();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  // On utilise un type union pour gérer le cours factice "Discussion Libre"
  const [selectedCourse, setSelectedCourse] = useState<Course | { title: string, extracted_text: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadCourses();
  }, [user]);

  const loadCourses = async () => {
    if (!user) return;
    try {
      const data = await getUserCourses(user.id);
      setCourses(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ MODE LIBRE
  const startFreeChat = () => {
      setSelectedCourse({
          title: "Discussion Libre",
          extracted_text: "" // Contexte vide = Tuteur Général
      });
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600"/></div>;

  return (
    <div className="h-[calc(100vh-80px)] md:h-screen flex flex-col bg-slate-50 pb-20 md:pb-0">

      {/* Header Mobile */}
      {!selectedCourse && (
          <div className="px-6 py-6 md:pt-10">
              <h1 className="text-3xl font-black text-slate-900 mb-2">Tuteur IA</h1>
              <p className="text-slate-500 font-medium">Posez des questions sur vos cours ou demandez conseil.</p>
          </div>
      )}

      <div className="flex-1 overflow-hidden px-4 md:px-8 md:pb-8 max-w-5xl mx-auto w-full">

        {!selectedCourse ? (
            <div className="h-full overflow-y-auto pb-20">

                {/* ✅ OPTION 1 : CHAT LIBRE (Mis en avant) */}
                <button
                    onClick={startFreeChat}
                    className="w-full mb-8 group relative overflow-hidden bg-slate-900 rounded-[2rem] p-8 text-left shadow-xl hover:-translate-y-1 transition-transform"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full blur-[80px] opacity-30 -mr-16 -mt-16 group-hover:opacity-50 transition-opacity"></div>
                    <div className="relative z-10 flex items-center gap-6">
                        <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white border border-white/10 shadow-inner group-hover:scale-110 transition-transform">
                            <Sparkles size={32} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-white mb-1">Tuteur Général</h3>
                            <p className="text-slate-300 font-medium text-sm md:text-base">Besoin d'aide en méthodologie, orientation ou culture générale ?</p>
                        </div>
                    </div>
                </button>

                <h2 className="text-lg font-bold text-slate-900 mb-4 px-2">Discuter d'un cours spécifique</h2>

                {courses.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-3xl bg-white mx-2">
                        <p className="text-slate-400 font-bold mb-4">Aucun cours disponible.</p>
                        <button onClick={() => router.push('/workspace/capture')} className="text-blue-600 font-bold border-b-2 border-blue-600 hover:border-transparent transition-all">Créer un cours</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {courses.map(course => (
                            <button
                                key={course.id}
                                onClick={() => setSelectedCourse(course)}
                                className="flex items-center p-4 bg-white border border-slate-200 rounded-2xl active:scale-[0.98] transition-all text-left shadow-sm hover:shadow-md hover:border-blue-200 group"
                            >
                                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mr-4 shrink-0 font-black text-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    {course.title.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-bold text-slate-900 truncate text-sm group-hover:text-blue-600 transition-colors">{course.title}</h3>
                                    <p className="text-xs text-slate-400 mt-0.5">{course.subject || 'Général'}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        ) : (
            // VUE CHAT
            <div className="flex flex-col h-full bg-white md:rounded-[2rem] md:shadow-xl md:border md:border-slate-200 overflow-hidden relative">
                <div className="px-4 py-3 border-b border-slate-100 bg-white flex items-center justify-between shrink-0 z-10 shadow-sm">
                    <button onClick={() => setSelectedCourse(null)} className="p-2 -ml-2 text-slate-400 hover:text-slate-900 transition-colors flex items-center gap-2 font-bold text-sm">
                        <ArrowLeft size={18} /> Retour
                    </button>
                    <div className="flex flex-col items-center">
                        <span className="text-sm font-bold text-slate-900 line-clamp-1 max-w-[200px]">{selectedCourse.title}</span>
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                            <span className="text-[10px] font-bold text-green-600 uppercase tracking-wide">En ligne</span>
                        </div>
                    </div>
                    <div className="w-16"></div>
                </div>

                <div className="flex-1 overflow-hidden relative bg-slate-50/50">
                    <CourseChat
                        // @ts-ignore
                        courseText={selectedCourse.extracted_text || ""}
                        courseTitle={selectedCourse.title}
                    />
                </div>
            </div>
        )}
      </div>
    </div>
  );
}