'use client';

import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Plus, Flame, ArrowRight, Book, Trophy } from 'lucide-react';
import { getUserCourses, Course } from '@/lib/courseService';

export default function WorkspacePage() {
  const { user } = useUser();
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
    <div className="animate-in fade-in duration-500 space-y-10 pb-20">

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-1">Bonjour, {user?.firstName} 👋</h1>
          <p className="text-slate-500 font-medium">Prêt à apprendre quelque chose de nouveau ?</p>
        </div>
        <div className="flex items-center gap-3 bg-white border-2 border-slate-100 px-5 py-3 rounded-2xl shadow-sm">
             <Flame size={24} className="text-amber-500 fill-amber-500 animate-pulse" />
             <div className="flex flex-col">
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Série</span>
                 <span className="text-lg font-black text-slate-900 leading-none">1 Jour</span>
             </div>
        </div>
      </div>

      {/* Hero Grid */}
      <div className="grid md:grid-cols-3 gap-6">
          {/* Carte Principale : Nouveau Cours */}
          <Link href="/workspace/capture" className="col-span-2 bg-slate-900 rounded-[2.5rem] p-10 relative overflow-hidden group hover:shadow-2xl hover:shadow-slate-900/20 hover:-translate-y-1 transition-all duration-300 cursor-pointer">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-white/20 transition-colors"></div>
              <div className="relative z-10 h-full flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-12">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white">
                          <Plus size={32} />
                      </div>
                      <div className="bg-white/10 px-4 py-1.5 rounded-full text-xs font-bold text-white uppercase tracking-wide">Nouveau</div>
                  </div>
                  <div>
                      <h2 className="text-3xl font-bold text-white mb-2">Ajouter un cours</h2>
                      <p className="text-slate-300 font-medium mb-8 text-lg max-w-md">Transformez vos notes en quiz et flashcards en quelques secondes.</p>
                      <span className="inline-flex items-center gap-3 bg-white text-slate-900 px-8 py-4 rounded-2xl font-bold group-hover:scale-105 transition-transform">
                          Commencer <ArrowRight size={20} />
                      </span>
                  </div>
              </div>
          </Link>

          {/* Widget Progression */}
          <div className="bg-blue-50 border-2 border-blue-100 rounded-[2.5rem] p-8 flex flex-col justify-between">
               <div>
                   <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                       <Trophy size={28} strokeWidth={2.5} />
                   </div>
                   <h3 className="font-extrabold text-blue-900 text-2xl mb-1">Niveau 3</h3>
                   <p className="text-blue-600/80 font-medium">Continuez comme ça !</p>
               </div>
               <div className="mt-auto">
                   <div className="flex justify-between text-xs font-bold text-blue-800 mb-2 uppercase tracking-wide">
                       <span>XP</span>
                       <span>1250 / 2000</span>
                   </div>
                   <div className="w-full bg-blue-200 h-4 rounded-full overflow-hidden">
                       <div className="bg-blue-600 h-full w-[65%] rounded-full"></div>
                   </div>
               </div>
          </div>
      </div>

      {/* Liste des Cours */}
      <div>
          <div className="flex items-center justify-between mb-6 px-2">
              <h2 className="text-2xl font-extrabold text-slate-900">Vos Cours</h2>
              <Link href="/workspace/courses" className="text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors">Tout voir</Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
              {loading ? (
                 [1,2,3].map(i => <div key={i} className="h-64 bg-slate-50 rounded-[2rem] animate-pulse"></div>)
              ) : courses.length === 0 ? (
                 <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-200 rounded-[2.5rem]">
                     <p className="text-slate-400 font-bold text-lg">C'est vide ici. Créez votre premier cours !</p>
                 </div>
              ) : (
                 courses.map(course => (
                     <Link href={`/workspace/courses/${course.id}`} key={course.id} className="card-b group flex flex-col h-full min-h-[240px]">
                         <div className="flex justify-between items-start mb-6">
                             <div className="w-14 h-14 bg-slate-100 text-slate-900 rounded-2xl flex items-center justify-center font-black text-2xl group-hover:bg-slate-900 group-hover:text-white transition-colors">
                                 {course.title.charAt(0).toUpperCase()}
                             </div>
                         </div>
                         <h3 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                             {course.title}
                         </h3>
                         <div className="mt-auto pt-6 border-t border-slate-50 flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wide">
                             <Book size={14}/>
                             <span>{new Date(course.created_at).toLocaleDateString()}</span>
                         </div>
                     </Link>
                 ))
              )}
          </div>
      </div>
    </div>
  );
}