'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { getCourseById, updateCourse, Course } from '@/lib/courseService';
import { getCourseFlashcardDecks } from '@/lib/flashcardService';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Loader2, Calendar, Edit2, Check, X, Copy, Download } from 'lucide-react';
import CourseActions from '@/components/workspace/CourseActions';

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [copied, setCopied] = useState(false);
  const [quizCount, setQuizCount] = useState(0);
  const [flashcardCount, setFlashcardCount] = useState(0);

  useEffect(() => {
    if (isLoaded && user && params.id) {
      loadCourse();
      loadStats();
    }
  }, [isLoaded, user, params.id]);

  const loadCourse = async () => {
    if (!user) return;

    try {
      const data = await getCourseById(Number(params.id), user.id);
      if (!data) {
        router.push('/workspace/courses');
        return;
      }
      setCourse(data);
      setEditedTitle(data.title);
      setEditedDescription(data.description || '');
    } catch (err) {
      console.error('Erreur:', err);
      router.push('/workspace/courses');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    if (!user) return;

    try {
      // Compter les quiz liés à ce cours
      const { count: quizCountResult } = await supabase
        .from('quiz_history')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      setQuizCount(quizCountResult || 0);

      // Compter les flashcard decks
      const flashcardDecks = await getCourseFlashcardDecks(user.id, Number(params.id));
      setFlashcardCount(flashcardDecks.length);

    } catch (err) {
      console.error('Erreur chargement stats:', err);
    }
  };

  const handleSaveEdit = async () => {
    if (!user || !course) return;

    try {
      await updateCourse(course.id, user.id, {
        title: editedTitle,
        description: editedDescription
      });
      setCourse({ ...course, title: editedTitle, description: editedDescription });
      setEditing(false);
    } catch (err: any) {
      alert(`Erreur: ${err.message}`);
    }
  };

  const handleCopyText = () => {
    if (!course) return;
    navigator.clipboard.writeText(course.extracted_text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadText = () => {
    if (!course) return;
    const blob = new Blob([course.extracted_text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${course.title}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Loader2 className="animate-spin h-12 w-12 text-blue-600" />
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <button
          onClick={() => router.push('/workspace/courses')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          Retour aux cours
        </button>

        {/* Course Info Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          {/* Title Section */}
          <div className="p-8 border-b border-gray-200">
            {editing ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="w-full text-3xl font-bold text-gray-900 border-2 border-blue-500 rounded-lg px-4 py-2 focus:outline-none"
                  placeholder="Titre du cours"
                />
                <textarea
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  className="w-full text-gray-600 border-2 border-blue-500 rounded-lg px-4 py-2 focus:outline-none resize-none"
                  rows={3}
                  placeholder="Description (optionnel)"
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleSaveEdit}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
                  >
                    <Check size={18} />
                    <span>Sauvegarder</span>
                  </button>
                  <button
                    onClick={() => {
                      setEditing(false);
                      setEditedTitle(course.title);
                      setEditedDescription(course.description || '');
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all"
                  >
                    <X size={18} />
                    <span>Annuler</span>
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-start justify-between mb-4">
                  <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
                  <button
                    onClick={() => setEditing(true)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                  >
                    <Edit2 size={20} />
                  </button>
                </div>
                {course.description && (
                  <p className="text-gray-600 mb-4">{course.description}</p>
                )}
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar size={16} className="mr-2" />
                  {new Date(course.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Course Actions */}
          <div className="p-8 bg-gray-50 border-b border-gray-200">
            <CourseActions
              courseId={course.id}
              quizCount={quizCount}
              flashcardCount={flashcardCount}
            />
          </div>

          {/* Text Content */}
          <div className="p-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">📝 Texte Extrait</h2>
              <div className="flex gap-2">
                <button
                  onClick={handleCopyText}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
                >
                  <Copy size={18} />
                  <span>{copied ? 'Copié !' : 'Copier'}</span>
                </button>
                <button
                  onClick={handleDownloadText}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all"
                >
                  <Download size={18} />
                  <span>Télécharger</span>
                </button>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 max-h-[400px] overflow-y-auto">
              <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800 leading-relaxed">
                {course.extracted_text}
              </pre>
            </div>

            <div className="mt-4 text-sm text-gray-500 flex items-center justify-between">
              <span>{course.extracted_text.length} caractères</span>
              <span>{course.extracted_text.split(/\s+/).length} mots</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}