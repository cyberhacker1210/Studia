'use client';

import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Plus, Flame, ArrowRight, Book, Trophy, Calendar } from 'lucide-react';
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
    <div className="animate-in fade-in duration-500 space-y-10 pb-20">

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-1">Bonjour, {user?.firstName} 👋</h1>
          <p className="text-slate-500 font-medium">Prêt à faire chauffer les neurones ?</p>
        </div>
        <div className="flex items-center gap-3 bg-white border-2 border-slate-100 px-5 py-3 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
             <Flame size={24} className="text-accent-yellow fill-accent-yellow animate-pulse" />
             <div className="flex flex-col">
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Série</span>
                 <span className="text-lg font-black text-slate-900 leading-none">1 Jour</span>
             </div>
        </div>
      </div>

      {/* WIDGET PARRAINAGE (Conditionnel) */}
      {!isPremium && energy === 0 && (
          <ReferralWidget />
      )}

      {/* Hero Grid */}
      <div className="grid md:grid-cols-3 gap-6">
          {/* Carte Principale : Gradient animé */}
          <Link href="/workspace/capture" className="col-span-2 bg-gradient-brand rounded-[2.5rem] p-10 relative overflow-hidden group hover:shadow-2xl hover:shadow-blue-200 hover:-translate-y-1 transition-all duration-300 cursor-pointer">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-white/20 transition-colors animate-pulse-slow"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full -ml-10 -mb-10 blur-2xl"></div>

              <div className="relative z-10 h-full flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-12">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white shadow-inner border border-white/10">
                          <Plus size={32} />
                      </div>
                      <div className="bg-white/10 backdrop-blur px-4 py-1.5 rounded-full text-xs font-bold text-white uppercase tracking-wide border border-white/10">
                          Nouveau
                      </div>
                  </div>
                  <div>
                      <h2 className="text-3xl font-black text-white mb-2">Ajouter un cours</h2>
                      <p className="text-blue-100 font-medium mb-8 text-lg max-w-md">Transformez vos notes en quiz et flashcards en quelques secondes.</p>
                      <span className="inline-flex items-center gap-3 bg-white text-brand-600 px-8 py-4 rounded-2xl font-bold group-hover:scale-105 transition-transform shadow-lg">
                          Commencer <ArrowRight size={20} strokeWidth={3} />
                      </span>
                  </div>
              </div>
          </Link>

          {/* Widget Progression : Teinté */}
          <div className="bg-indigo-50/50 border-2 border-indigo-100 rounded-[2.5rem] p-8 flex flex-col justify-between relative overflow-hidden hover:border-indigo-200 transition-colors">
               <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-200/20 rounded-full blur-2xl"></div>

               <div className="relative z-10">
                   <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                       <Trophy size={28} strokeWidth={2.5} />
                   </div>
                   <h3 className="font-extrabold text-indigo-900 text-2xl mb-1">Niveau 3</h3>
                   <p className="text-indigo-600/80 font-medium">Continuez comme ça !</p>
               </div>
               <div className="mt-auto relative z-10">
                   <div className="flex justify-between text-xs font-bold text-indigo-800 mb-2 uppercase tracking-wide">
                       <span>XP</span>
                       <span>1250 / 2000</span>
                   </div>
                   <div className="w-full bg-white h-4 rounded-full overflow-hidden border border-indigo-100">
                       <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full w-[65%] rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                   </div>
               </div>
          </div>
      </div>

      {/* Liste des Cours */}
      <div>
          <div className="flex items-center justify-between mb-6 px-2">
              <h2 className="text-2xl font-extrabold text-slate-900">Vos Cours</h2>
              <Link href="/workspace/courses" className="text-sm font-bold text-slate-400 hover:text-brand-600 transition-colors flex items-center gap-1">
                  Tout voir <ArrowRight size={14}/>
              </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
              {loading ? (
                 [1,2,3].map(i => <div key={i} className="h-64 bg-slate-50 rounded-[2rem] animate-pulse"></div>)
              ) : courses.length === 0 ? (
                 <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-slate-50/50">
                     <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                         <Book size={32} className="text-slate-300" />
                     </div>
                     <h3 className="text-xl font-bold text-slate-900 mb-2">C'est vide ici.</h3>
                     <p className="text-slate-500 font-medium mb-8">Commencez par ajouter votre premier cours.</p>
                     <Link href="/workspace/capture" className="btn-b-primary inline-flex">
                         Créer un cours
                     </Link>
                 </div>
              ) : (
                 courses.map(course => (
                     <Link href={`/workspace/courses/${course.id}`} key={course.id} className="group bg-white border-2 border-slate-100 hover:border-brand-200 rounded-[2rem] p-8 hover:shadow-xl hover:shadow-blue-100/50 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full min-h-[240px] relative overflow-hidden">
                         {/* Glow Effect */}
                         <div className="absolute inset-0 bg-gradient-to-br from-brand-50/0 to-brand-50/0 group-hover:from-brand-50/30 group-hover:to-transparent transition-all duration-500"></div>

                         <div className="relative z-10">
                             <div className="flex justify-between items-start mb-6">
                                 <div className="w-14 h-14 bg-gradient-to-br from-brand-100 to-brand-50 text-brand-600 rounded-2xl flex items-center justify-center font-black text-2xl group-hover:scale-110 transition-transform shadow-sm border border-brand-100">
                                     {course.title.charAt(0).toUpperCase()}
                                 </div>
                             </div>
                             <h3 className="text-xl font-extrabold text-slate-900 mb-3 line-clamp-2 group-hover:text-brand-600 transition-colors">
                                 {course.title}
                             </h3>
                             <div className="mt-auto pt-6 border-t border-slate-50 flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wide">
                                 <Calendar size={14}/>
                                 <span>{new Date(course.created_at).toLocaleDateString()}</span>
                             </div>
                         </div>
                     </Link>
                 ))
              )}
          </div>
      </div>
    </div>
  );
}