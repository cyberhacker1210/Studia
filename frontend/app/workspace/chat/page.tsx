'use client';

import { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { getUserCourses, Course } from '@/lib/courseService';
import CourseChat from '@/components/workspace/CourseChat';
import { MessageSquare, BookOpen, ArrowLeft, Loader2, Bot } from 'lucide-react';

export default function ChatPage() {
  const { user } = useUser();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
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

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600"/></div>;

  return (
    <div className="h-[calc(100vh-80px)] md:h-screen flex flex-col bg-slate-50 pb-20 md:pb-0"> {/* Hauteur ajustée pour mobile */}

      {/* Header Mobile (si pas de cours sélectionné) */}
      {!selectedCourse && (
          <div className="px-6 py-6 md:pt-10">
              <h1 className="text-3xl font-black text-slate-900 mb-2">Tuteur IA</h1>
              <p className="text-slate-500 font-medium">Posez des questions sur vos cours.</p>
          </div>
      )}

      {/* CONTENU PRINCIPAL */}
      <div className="flex-1 overflow-hidden px-4 md:px-8 md:pb-8 max-w-5xl mx-auto w-full">

        {!selectedCourse ? (
            // VUE : LISTE DES COURS (Mobile Grid)
            <div className="h-full overflow-y-auto pb-20">
                {courses.length === 0 ? (
                    <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-3xl bg-white mx-4">
                        <BookOpen size={32} className="mx-auto text-slate-300 mb-4" />
                        <p className="text-slate-500 font-medium mb-4">Aucun cours disponible.</p>
                        <button onClick={() => router.push('/workspace/capture')} className="text-blue-600 font-bold border-b-2 border-blue-600 hover:border-transparent transition-all">Créer mon premier cours</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {courses.map(course => (
                            <button
                                key={course.id}
                                onClick={() => setSelectedCourse(course)}
                                className="flex items-center p-4 bg-white border border-slate-200 rounded-2xl active:scale-[0.98] transition-all text-left shadow-sm hover:shadow-md"
                            >
                                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mr-4 shrink-0 font-bold">
                                    {course.title.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 line-clamp-1 text-sm">{course.title}</h3>
                                    <p className="text-xs text-slate-400 mt-0.5">{new Date(course.created_at).toLocaleDateString()}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        ) : (
            // VUE : CHAT ACTIF
            <div className="flex flex-col h-full bg-white md:rounded-[2rem] md:shadow-xl md:border md:border-slate-200 overflow-hidden relative">

                {/* Chat Header */}
                <div className="px-4 py-3 border-b border-slate-100 bg-white flex items-center justify-between shrink-0 z-10 shadow-sm">
                    <button onClick={() => setSelectedCourse(null)} className="p-2 -ml-2 text-slate-400 hover:text-slate-900">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex flex-col items-center">
                        <span className="text-sm font-bold text-slate-900 line-clamp-1 max-w-[200px]">{selectedCourse.title}</span>
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                            <span className="text-[10px] font-bold text-green-600 uppercase tracking-wide">Tuteur En ligne</span>
                        </div>
                    </div>
                    <div className="w-8"></div> {/* Spacer pour centrer */}
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-hidden relative bg-slate-50/50">
                    <CourseChat
                        courseText={selectedCourse.extracted_text}
                        courseTitle={selectedCourse.title}
                    />
                </div>
            </div>
        )}
      </div>
    </div>
  );
}