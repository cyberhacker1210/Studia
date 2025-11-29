'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { getUserCourses, Course } from '@/lib/courseService';
import { ArrowLeft, Loader2, Bot, Plus, Calendar, Sparkles, ChevronRight } from 'lucide-react';
import Link from 'next/link';

// --- COMPOSANT MASCOTTE ANIMÉE ---
const StudiaBot = () => (
  <div className="relative w-24 h-24 mx-auto mb-6 group cursor-pointer">
    {/* Corps du robot */}
    <div className="absolute inset-0 bg-slate-900 rounded-3xl shadow-xl transform transition-transform duration-700 group-hover:rotate-12 animate-bounce-slow flex items-center justify-center z-10">
      <Bot className="text-white w-12 h-12" />
      {/* Yeux qui clignent (via des points) */}
      <div className="absolute top-8 left-8 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
      <div className="absolute top-8 right-8 w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
    </div>
    {/* Ombre portée */}
    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-4 bg-black/10 rounded-full blur-md animate-pulse"></div>

    {/* Bulles de pensée décoratives */}
    <div className="absolute -top-4 -right-4 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-bounce" style={{ animationDelay: '1s' }}>
      ?
    </div>
    <div className="absolute -bottom-2 -left-6 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-slate-900 shadow-sm animate-bounce" style={{ animationDelay: '0.2s' }}>
      <Sparkles size={16} />
    </div>
  </div>
);

export default function SelectCourseForQuizPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && user) {
      getUserCourses(user.id).then((data) => {
        setCourses(data);
        setLoading(false);
      });
    }
  }, [isLoaded, user]);

  if (!isLoaded || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-6">
           <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center animate-bounce">
              <Bot className="text-slate-300 w-8 h-8" />
           </div>
           <span className="text-slate-400 font-bold text-sm uppercase tracking-widest animate-pulse">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-20 pt-8 px-6">

      {/* Bouton Retour */}
      <button
        onClick={() => router.push('/workspace/quiz')}
        className="group flex items-center gap-3 text-slate-500 hover:text-slate-900 mb-12 font-bold text-sm transition-colors w-fit"
      >
        <div className="w-10 h-10 rounded-full border-2 border-slate-100 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all bg-slate-50">
          <ArrowLeft size={18} />
        </div>
        Retour au Hub
      </button>

      {/* Header avec Mascotte */}
      <div className="text-center mb-16 animate-in slide-in-from-bottom-4 duration-700">
        <StudiaBot />
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
          Prêt pour un défi ?
        </h1>
        <p className="text-xl text-slate-500 font-medium max-w-lg mx-auto leading-relaxed">
          Sélectionnez un cours. Je vais générer des questions sur mesure pour tester vos connaissances.
        </p>
      </div>

      {/* Liste des cours */}
      {courses.length === 0 ? (
        <div className="max-w-md mx-auto text-center p-10 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] animate-in zoom-in-95">
          <h3 className="text-xl font-bold text-slate-900 mb-2">C'est vide ici !</h3>
          <p className="text-slate-500 mb-8 font-medium">Vous devez d'abord ajouter un cours.</p>
          <button
            onClick={() => router.push('/workspace/capture')}
            className="btn-b-primary w-full"
          >
            <Plus size={20} /> Créer un cours
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">

          {/* Carte "Créer nouveau" (Toujours utile) */}
          <div
            onClick={() => router.push('/workspace/capture')}
            className="group border-2 border-dashed border-slate-200 rounded-[2rem] p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-slate-900 hover:bg-slate-50 transition-all min-h-[280px]"
          >
             <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Plus size={32} className="text-slate-400 group-hover:text-slate-900 transition-colors" />
             </div>
             <h3 className="font-bold text-slate-900 text-lg">Nouveau Cours</h3>
             <p className="text-sm text-slate-500 mt-1">Importer des photos</p>
          </div>

          {/* Cartes des Cours existants */}
          {courses.map((course) => (
            <button
              key={course.id}
              onClick={() => router.push(`/workspace/courses/${course.id}/generate-quiz`)}
              className="card-b group text-left relative flex flex-col h-full min-h-[280px] hover:-translate-y-2"
            >
              {/* Badge date */}
              <div className="absolute top-6 right-6 bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                 <Calendar size={10} />
                 {new Date(course.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
              </div>

              <div className="mb-6">
                 <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl font-black group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-sm">
                    {course.title.charAt(0).toUpperCase()}
                 </div>
              </div>

              <h3 className="text-xl font-extrabold text-slate-900 mb-3 line-clamp-2 leading-tight">
                {course.title}
              </h3>

              <p className="text-sm text-slate-500 font-medium line-clamp-3 mb-6 flex-1 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                {course.extracted_text.substring(0, 120)}...
              </p>

              <div className="flex items-center text-blue-600 font-bold text-sm group-hover:gap-2 transition-all">
                <span>Générer le quiz</span>
                <ChevronRight size={16} strokeWidth={3} />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}