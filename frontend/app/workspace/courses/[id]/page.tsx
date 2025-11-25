'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { getCourseById, Course } from '@/lib/courseService';
import { ArrowLeft, Calendar, FileQuestion, Layers, BrainCircuit, Clock } from 'lucide-react';
import ReactMarkdown from 'react-markdown'; // ⚠️ npm install react-markdown

export default function CourseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && params.id) loadCourse();
  }, [user, params.id]);

  const loadCourse = async () => {
    try {
      const data = await getCourseById(Number(params.id), user!.id);
      setCourse(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!course) return <div className="p-10">Chargement...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 md:px-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8">
            <button onClick={() => router.push('/workspace')} className="flex items-center text-gray-500 mb-4 hover:text-gray-900">
                <ArrowLeft size={20} className="mr-2"/> Retour
            </button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.title}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1"><Clock size={14}/> Ajouté le {new Date(course.created_at).toLocaleDateString()}</span>
                {/* On affichera la date d'exam ici plus tard */}
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* COLONNE GAUCHE : Actions */}
            <div className="space-y-4">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-4">Outils IA</h3>
                    <div className="space-y-2">
                        <button
                            onClick={() => router.push(`/workspace/courses/${course.id}/mastery`)}
                            className="w-full flex items-center gap-3 p-3 bg-purple-50 text-purple-700 rounded-xl font-bold hover:bg-purple-100 transition-colors"
                        >
                            <BrainCircuit size={20}/> Mode Parcours
                        </button>
                        <button
                            onClick={() => router.push(`/workspace/courses/${course.id}/generate-quiz`)}
                            className="w-full flex items-center gap-3 p-3 bg-gray-50 text-gray-700 rounded-xl font-medium hover:bg-gray-100 transition-colors"
                        >
                            <FileQuestion size={20}/> Générer un Quiz
                        </button>
                        <button
                            onClick={() => router.push(`/workspace/courses/${course.id}/generate-flashcards`)}
                            className="w-full flex items-center gap-3 p-3 bg-gray-50 text-gray-700 rounded-xl font-medium hover:bg-gray-100 transition-colors"
                        >
                            <Layers size={20}/> Créer Flashcards
                        </button>
                    </div>
                </div>
            </div>

            {/* COLONNE DROITE : Contenu du cours */}
            <div className="lg:col-span-2">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 min-h-[500px]">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">Contenu du cours</h2>

                    {/* Affichage Markdown Propre */}
                    <div className="prose prose-indigo max-w-none text-gray-700 leading-relaxed">
                        <ReactMarkdown>
                            {course.extracted_text}
                        </ReactMarkdown>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}