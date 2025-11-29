'use client';

import { useState, useEffect } from 'react';
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-slate-900 animate-spin" />
            <span className="text-slate-400 text-sm font-medium">Chargement de votre assistant...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="max-w-6xl mx-auto px-6 py-8 h-screen flex flex-col">

        {/* Header */}
        <header className="flex items-center justify-between mb-8 shrink-0">
            <div className="flex items-center gap-4">
                <button
                onClick={() => selectedCourse ? setSelectedCourse(null) : router.push('/workspace')}
                className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors"
                >
                <ArrowLeft size={18} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Tuteur Socratique</h1>
                    <p className="text-slate-500 text-sm">Posez des questions sur vos cours</p>
                </div>
            </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden bg-white border border-slate-200 rounded-3xl shadow-sm relative flex flex-col">

            {!selectedCourse ? (
            // VIEW: SELECT COURSE
            <div className="flex-1 overflow-y-auto p-8 md:p-12">
                <h2 className="text-xl font-bold mb-6 text-center">Choisissez un sujet</h2>

                {courses.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
                    <BookOpen size={40} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500 font-medium mb-4">Aucun cours disponible.</p>
                    <button
                    onClick={() => router.push('/workspace/capture')}
                    className="text-slate-900 font-bold border-b-2 border-slate-900 hover:border-transparent transition-all"
                    >
                    Créer mon premier cours
                    </button>
                </div>
                ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {courses.map(course => (
                    <button
                        key={course.id}
                        onClick={() => setSelectedCourse(course)}
                        className="group flex flex-col items-start p-6 bg-white border border-slate-200 rounded-2xl hover:border-slate-900 hover:shadow-md transition-all text-left h-full"
                    >
                        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                            <BookOpen size={18} />
                        </div>
                        <h3 className="font-bold text-slate-900 mb-2 line-clamp-2">
                        {course.title}
                        </h3>
                        <p className="text-xs text-slate-400 mt-auto pt-4 border-t border-slate-100 w-full">
                        Ajouté le {new Date(course.created_at).toLocaleDateString()}
                        </p>
                    </button>
                    ))}
                </div>
                )}
            </div>
            ) : (
            // VIEW: CHAT
            <div className="flex flex-col h-full animate-in fade-in">
                {/* Chat Header */}
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center">
                            <Bot size={16} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-900">{selectedCourse.title}</span>
                            <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider">En ligne</span>
                        </div>
                    </div>
                    <button
                        onClick={() => router.push(`/workspace/courses/${selectedCourse.id}`)}
                        className="text-xs font-bold text-slate-500 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 transition-all"
                    >
                        Voir le cours
                    </button>
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-hidden relative">
                    <CourseChat
                        courseText={selectedCourse.extracted_text}
                        courseTitle={selectedCourse.title}
                    />
                </div>
            </div>
            )}
        </div>
      </div>
    </div>
  );
}