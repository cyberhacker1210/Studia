'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { getUserCourses, Course } from '@/lib/courseService';
import { ArrowLeft, Loader2, BookOpen, ChevronRight, Calendar, Brain, Search, Plus } from 'lucide-react';
import Link from 'next/link';

export default function SelectCourseForQuizPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (isLoaded && user) {
      getUserCourses(user.id).then((data) => {
        setCourses(data);
        setLoading(false);
      });
    }
  }, [isLoaded, user]);

  const filteredCourses = courses.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isLoaded || loading) {
    return <div className="flex h-screen items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-blue-600 h-12 w-12"/></div>;
  }

  return (
    <div className="max-w-5xl mx-auto pb-20 pt-8 px-6 min-h-screen">

      {/* Bouton Retour */}
      <button onClick={() => router.push('/workspace/quiz')} className="group flex items-center gap-3 text-slate-500 hover:text-slate-900 mb-12 font-bold text-sm transition-colors w-fit">
        <div className="w-10 h-10 rounded-full border-2 border-slate-200 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all bg-slate-50">
          <ArrowLeft size={18} />
        </div>
        Retour au Hub
      </button>

      {/* Header */}
      <div className="text-center mb-16 animate-in slide-in-from-bottom-4 duration-700">
        <div className="relative w-24 h-24 mx-auto mb-6 group">
            <div className="absolute inset-0 bg-blue-100 rounded-3xl transform rotate-6 group-hover:rotate-12 transition-transform duration-500"></div>
            <div className="absolute inset-0 bg-white border-2 border-slate-100 rounded-3xl shadow-xl flex items-center justify-center z-10">
                <Brain className="text-blue-600 w-12 h-12" />
            </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
          Nouveau Quiz
        </h1>
        <p className="text-xl text-slate-500 font-medium max-w-lg mx-auto leading-relaxed">
          Sélectionnez le cours sur lequel vous voulez vous entraîner.
        </p>
      </div>

      {/* Recherche & Liste */}
      <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">

          {/* Barre de Recherche */}
          {courses.length > 0 && (
              <div className="max-w-md mx-auto mb-12 relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                  <input
                    type="text"
                    placeholder="Rechercher un cours..."
                    className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-700 outline-none focus:border-blue-500 transition-all shadow-sm focus:shadow-md"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
              </div>
          )}

          {courses.length === 0 ? (
            <div className="max-w-md mx-auto text-center p-10 bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem]">
              <h3 className="text-xl font-bold text-slate-900 mb-2">C'est vide ici !</h3>
              <p className="text-slate-500 mb-8 font-medium">Vous devez d'abord ajouter un cours.</p>
              <button onClick={() => router.push('/workspace/capture')} className="btn-b-primary w-full">
                <Plus size={20} /> Créer un cours
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

              {/* Carte "Nouveau" toujours utile */}
              <div onClick={() => router.push('/workspace/capture')} className="group border-2 border-dashed border-slate-200 rounded-[2rem] p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all min-h-[240px]">
                 <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-white group-hover:text-blue-600 transition-colors shadow-sm">
                    <Plus size={32} className="text-slate-400 group-hover:text-blue-600" />
                 </div>
                 <h3 className="font-bold text-slate-900 text-lg">Nouveau Cours</h3>
                 <p className="text-sm text-slate-500 mt-1">Importer des photos</p>
              </div>

              {/* Liste des Cours */}
              {filteredCourses.map((course) => (
                <button
                  key={course.id}
                  onClick={() => router.push(`/workspace/courses/${course.id}/generate-quiz`)}
                  className="group bg-white border border-slate-200 p-6 rounded-[2rem] text-left hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden h-full flex flex-col"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150"></div>

                  <div className="relative z-10 flex-1">
                      <div className="flex justify-between items-start mb-6">
                         <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-xl font-black shadow-lg group-hover:rotate-12 transition-transform">
                            {course.title.charAt(0).toUpperCase()}
                         </div>
                         <div className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 uppercase tracking-wide">
                             <Calendar size={10} /> {new Date(course.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                         </div>
                      </div>

                      <h3 className="text-xl font-extrabold text-slate-900 mb-2 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
                          {course.subject || 'Général'}
                      </p>
                  </div>

                  <div className="relative z-10 flex items-center gap-2 text-sm font-bold text-slate-900 group-hover:gap-3 transition-all">
                    <span>Configurer le quiz</span>
                    <ChevronRight size={16} strokeWidth={3} className="text-blue-500"/>
                  </div>
                </button>
              ))}
            </div>
          )}
      </div>
    </div>
  );
}