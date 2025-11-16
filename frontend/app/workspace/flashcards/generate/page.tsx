'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { getUserCourses, Course } from '@/lib/courseService';
import { ArrowLeft, Loader2, BookOpen, ChevronRight, Calendar } from 'lucide-react';

export default function SelectCourseForFlashcardsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && user) {
      loadCourses();
    }
  }, [isLoaded, user]);

  const loadCourses = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await getUserCourses(user.id);
      setCourses(data);
    } catch (err: any) {
      console.error('Erreur chargement cours:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement des cours...</p>
        </div>
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
          onClick={() => router.push('/workspace/flashcards')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          Retour
        </button>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎴 Sélectionnez un Cours
          </h1>
          <p className="text-lg text-gray-600">
            Choisissez le cours depuis lequel générer des flashcards
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">❌ {error}</p>
          </div>
        )}

        {/* Courses List */}
        {courses.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center max-w-2xl mx-auto">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen size={48} className="text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Aucun cours disponible
            </h3>
            <p className="text-gray-600 mb-6">
              Capturez d'abord un cours pour pouvoir générer des flashcards
            </p>
            <button
              onClick={() => router.push('/workspace/capture')}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-all"
            >
              📸 Capturer un cours
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <button
                key={course.id}
                onClick={() => router.push(`/workspace/courses/${course.id}/generate-flashcards`)}
                className="group bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl hover:border-purple-500 transition-all transform hover:scale-105 text-left"
              >
                {/* Preview du texte */}
                <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-b border-gray-200 h-32 overflow-hidden">
                  <p className="text-sm text-gray-700 line-clamp-4 font-mono">
                    {course.extracted_text.substring(0, 200)}...
                  </p>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
                    {course.title}
                  </h3>

                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <Calendar size={16} className="mr-1" />
                    {new Date(course.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </div>

                  <div className="text-xs text-gray-500 mb-4">
                    {course.extracted_text.length} caractères
                  </div>

                  {/* Action */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <span className="text-purple-600 font-semibold text-sm">
                      Générer des flashcards
                    </span>
                    <ChevronRight className="text-purple-600 group-hover:translate-x-1 transition-transform" size={20} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Quick Action */}
        {courses.length > 0 && (
          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">Vous n'avez pas le bon cours ?</p>
            <button
              onClick={() => router.push('/workspace/capture')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
            >
              📸 Capturer un nouveau cours
            </button>
          </div>
        )}
      </div>
    </div>
  );
}