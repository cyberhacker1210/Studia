'use client';

import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Plus, Flame, ArrowRight, Book, Trophy, Calendar, Sparkles, Brain, Layers } from 'lucide-react';
import { getUserCourses, Course } from '@/lib/courseService';
import ReferralWidget from '@/components/workspace/ReferralWidget';
import { useEnergy } from '@/hooks/useEnergy';

export default function WorkspacePage() {
  const { user } = useUser();
  const { energy, isPremium } = useEnergy();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      getUserCourses(user.id).then(data => {
        setCourses(data);
        setLoading(false);
      });
    }
  }, [user]);

  return (
    <div className="animate-in fade-in duration-500 pb-32 pt-6 px-6 max-w-7xl mx-auto">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-4">
        <div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-2">
            Salut {user?.firstName} 👋
          </h1>
          <p className="text-lg text-slate-500 font-medium">Prêt à exploser tes scores ?</p>
        </div>

        {/* Streak Badge */}
        <div className="flex items-center gap-3 bg-white border-2 border-slate-100 px-5 py-3 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-default">
             <Flame size={24} className="text-orange-500 fill-orange-500 animate-pulse" />
             <div className="flex flex-col">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider leading-none mb-1">Série</span>
                 <span className="text-xl font-black text-slate-900 leading-none">1 Jour</span>
             </div>
        </div>
      </div>

      {/* WIDGET PARRAINAGE */}
      {!isPremium && energy === 0 && (
          <div className="mb-10">
            <ReferralWidget />
          </div>
      )}

      {/* HERO GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">

          {/* CARTE GÉANTE SCANNER (2 colonnes) */}
          <Link href="/workspace/capture" className="col-span-1 md:col-span-2 group relative block h-80 md:h-96 active:scale-[0.99] transition-transform">
              <div className="absolute inset-0 bg-slate-900 rounded-[2.5rem] shadow-2xl shadow-slate-300 overflow-hidden">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600 rounded-full blur-[100px] opacity-40 -mr-20 -mt-20 animate-pulse-slow"></div>
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600 rounded-full blur-[80px] opacity-30 -ml-20 -mb-20"></div>

                  <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-between z-10">
                      <div className="flex justify-between items-start">
                          <div className="bg-white/10 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                              <Sparkles size={14} className="text-yellow-400"/> IA Vision
                          </div>
                          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white border border-white/10 group-hover:scale-110 transition-transform">
                              <Plus size={32} />
                          </div>
                      </div>

                      <div>
                          <h2 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight">
                              Scanner un cours
                          </h2>
                          <p className="text-slate-300 text-lg md:text-xl font-medium max-w-md leading-relaxed">
                              Transforme tes notes en machine à 20/20. Quiz, Flashcards et Synthèse instantanés.
                          </p>
                      </div>
                  </div>
              </div>
          </Link>

          {/* COLONNE DROITE (Actions Rapides) */}
          <div className="flex flex-col gap-6 h-full">
              <Link href="/workspace/quiz/generate" className="flex-1 bg-white border-2 border-slate-100 p-8 rounded-[2.5rem] flex flex-col justify-center items-center gap-4 hover:border-purple-200 hover:shadow-xl hover:-translate-y-1 transition-all group">
                  <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Brain size={32} />
                  </div>
                  <span className="font-bold text-xl text-slate-700">Générer un Quiz</span>
              </Link>
              <Link href="/workspace/flashcards" className="flex-1 bg-white border-2 border-slate-100 p-8 rounded-[2.5rem] flex flex-col justify-center items-center gap-4 hover:border-blue-200 hover:shadow-xl hover:-translate-y-1 transition-all group">
                  <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Layers size={32} />
                  </div>
                  <span className="font-bold text-xl text-slate-700">Mes Flashcards</span>
              </Link>
          </div>
      </div>

      {/* SECTION COURS RÉCENTS */}
      <div>
          <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-black text-slate-900">Activité Récente</h2>
              <Link href="/workspace/courses" className="text-sm font-bold text-blue-600 bg-blue-50 px-5 py-2.5 rounded-xl hover:bg-blue-100 transition-colors">
                  Voir tout
              </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                 [1,2,3].map(i => <div key={i} className="h-32 bg-slate-100 rounded-[2rem] animate-pulse"></div>)
              ) : courses.length === 0 ? (
                 <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-slate-50/50">
                     <Book size={48} className="mx-auto text-slate-300 mb-4" />
                     <h3 className="text-xl font-bold text-slate-900 mb-2">C'est le désert...</h3>
                     <p className="text-slate-500">Scanne ton premier cours pour commencer !</p>
                 </div>
              ) : (
                 courses.slice(0, 6).map(course => (
                     <Link href={`/workspace/courses/${course.id}`} key={course.id} className="group bg-white border border-slate-200 p-6 rounded-[2rem] flex items-center gap-6 hover:shadow-lg hover:-translate-y-1 transition-all">
                         <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-2xl font-black shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                             {course.title.charAt(0).toUpperCase()}
                         </div>
                         <div className="flex-1 min-w-0">
                             <h3 className="font-extrabold text-slate-900 text-lg truncate mb-1">{course.title}</h3>
                             <p className="text-sm text-slate-500 font-bold flex items-center gap-2">
                                 <span className="bg-slate-100 px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wide">{course.subject || 'Général'}</span>
                                 <span>• {new Date(course.created_at).toLocaleDateString()}</span>
                             </p>
                         </div>
                         <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                             <ArrowRight size={20} />
                         </div>
                     </Link>
                 ))
              )}
          </div>
      </div>
    </div>
  );
}