'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { getUserCourses, Course } from '@/lib/courseService';
import CourseChat from '@/components/workspace/CourseChat';
import { MessageSquare, BookOpen, ArrowLeft, Loader2 } from 'lucide-react';

export default function ChatPage() {
  const { user } = useUser();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadCourses();
    }
  }, [user]);

  const loadCourses = async () => {
    if (!user) return;
    try {
      const data = await getUserCourses(user.id);
      setCourses(data);
    } catch (error) {
      console.error('Erreur chargement cours:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <button
              onClick={() => selectedCourse ? setSelectedCourse(null) : router.push('/workspace')}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-2 transition-colors"
            >
              <ArrowLeft size={20} className="mr-2" />
              {selectedCourse ? 'Changer de cours' : 'Retour au Workspace'}
            </button>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-xl">
                <MessageSquare className="text-blue-600" size={32} />
              </div>
              Professeur IA
            </h1>
          </div>
        </div>

        {/* Contenu principal */}
        {!selectedCourse ? (
          // VUE 1 : SÉLECTION DU COURS
          <div>
            <p className="text-lg text-gray-600 mb-6">
              Sur quel cours souhaitez-vous poser des questions ?
            </p>

            {courses.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-200">
                <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Aucun cours disponible.</p>
                <button
                  onClick={() => router.push('/workspace/capture')}
                  className="mt-4 text-blue-600 font-medium hover:underline"
                >
                  Créer un cours
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.map(course => (
                  <button
                    key={course.id}
                    onClick={() => setSelectedCourse(course)}
                    className="group bg-white p-6 rounded-xl shadow-sm hover:shadow-md border border-gray-200 hover:border-blue-300 transition-all text-left"
                  >
                    <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors truncate">
                      {course.title}
                    </h3>
                    <p className="text-sm text-gray-500 flex items-center">
                      <BookOpen size={14} className="mr-1" />
                      {new Date(course.created_at).toLocaleDateString()}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          // VUE 2 : CHAT ACTIF
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-6 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Cours actif</span>
                <h3 className="font-bold text-blue-900">{selectedCourse.title}</h3>
              </div>
              <button
                onClick={() => router.push(`/workspace/courses/${selectedCourse.id}`)}
                className="text-xs text-blue-600 hover:underline"
              >
                Voir le cours complet
              </button>
            </div>

            <CourseChat
              courseText={selectedCourse.extracted_text}
              courseTitle={selectedCourse.title}
            />
          </div>
        )}
      </div>
    </div>
  );
}