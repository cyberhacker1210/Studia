'use client';

import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Plus, Flame, ArrowRight, Book, Trophy, Calendar, Sparkles, Zap, Brain, Layers } from 'lucide-react';
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
    <div className="animate-in fade-in duration-500 pb-32 pt-2 px-2 md:px-0">

      {/* HEADER MOBILE COMPACT */}
      <div className="flex items-center justify-between mb-6 md:mb-10">
        <div>
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">
            Salut {user?.firstName} 👋
          </h1>
          <p className="text-sm md:text-base text-slate-500 font-medium">Prêt à bosser ?</p>
        </div>

        {/* Streak (Visible seulement si > 0) */}
        <div className="flex flex-col items-center bg-white border-2 border-slate-100 px-3 py-2 rounded-xl shadow-sm">
             <Flame size={20} className="text-orange-500 fill-orange-500 animate-pulse" />
             <span className="text-[10px] font-black text-slate-900 uppercase">1 J</span>
        </div>
      </div>

      {/* WIDGET PARRAINAGE (Mobile: plus compact) */}
      {!isPremium && energy === 0 && (
          <div className="mb-6 scale-95 origin-top md:scale-100 md:origin-center">
            <ReferralWidget />
          </div>
      )}

      {/* ACTION PRINCIPALE (CARTE GÉANTE) */}
      <Link href="/workspace/capture" className="block group mb-8 md:mb-12 active:scale-[0.98] transition-transform touch-manipulation">
          <div className="bg-slate-900 rounded-[2rem] p-6 md:p-10 relative overflow-hidden shadow-xl shadow-slate-300">
              {/* Fond Animé */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full blur-[80px] opacity-40 -mr-10 -mt-10 animate-pulse-slow"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-600 rounded-full blur-[60px] opacity-30 -ml-10 -mb-10"></div>

              <div className="relative z-10 flex flex-col items-start">
                  <div className="bg-white/10 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Sparkles size={12} className="text-yellow-400"/> IA Vision
                  </div>

                  <h2 className="text-3xl md:text-5xl font-black text-white mb-2 leading-tight">
                      Scanner un cours
                  </h2>
                  <p className="text-slate-300 text-sm md:text-lg mb-8 max-w-xs font-medium leading-relaxed">
                      Photo ➔ Quiz & Fiches en 10 secondes.
                  </p>

                  <div className="w-full bg-white text-slate-900 font-bold text-base md:text-lg py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg group-hover:bg-slate-100 transition-colors">
                      <Plus size={20} strokeWidth={3} />
                      C'est parti
                  </div>
              </div>
          </div>
      </Link>

      {/* RACCOURCIS RAPIDES (Grille Mobile) */}
      <div className="grid grid-cols-2 gap-3 mb-10">
          <Link href="/workspace/quiz/generate" className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 active:bg-slate-50 transition-colors shadow-sm">
              <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
                  <Brain size={20} />
              </div>
              <span className="font-bold text-sm text-slate-700">Quiz</span>
          </Link>
          <Link href="/workspace/flashcards" className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 active:bg-slate-50 transition-colors shadow-sm">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                  <Layers size={20} />
              </div>
              <span className="font-bold text-sm text-slate-700">Réviser</span>
          </Link>
      </div>

      {/* LISTE DES COURS (Mobile: Liste verticale simple) */}
      <div>
          <div className="flex items-center justify-between mb-4 px-1">
              <h2 className="text-xl font-black text-slate-900">Récents</h2>
              <Link href="/workspace/courses" className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg">
                  Voir tout
              </Link>
          </div>

          <div className="flex flex-col gap-3">
              {loading ? (
                 [1,2,3].map(i => <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse"></div>)
              ) : courses.length === 0 ? (
                 <div className="py-10 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white">
                     <Book size={24} className="mx-auto text-slate-300 mb-2" />
                     <p className="text-sm text-slate-400 font-bold">Rien pour l'instant</p>
                 </div>
              ) : (
                 courses.slice(0, 3).map(course => (
                     <Link href={`/workspace/courses/${course.id}`} key={course.id} className="bg-white border border-slate-100 p-4 rounded-2xl flex items-center gap-4 active:scale-[0.98] transition-transform shadow-sm">
                         <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center text-lg font-black shrink-0">
                             {course.title.charAt(0).toUpperCase()}
                         </div>
                         <div className="flex-1 min-w-0">
                             <h3 className="font-bold text-slate-900 truncate text-base">{course.title}</h3>
                             <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                                 {course.subject || 'Général'} • {new Date(course.created_at).toLocaleDateString()}
                             </p>
                         </div>
                         <ArrowRight size={16} className="text-slate-300" />
                     </Link>
                 ))
              )}
          </div>
      </div>
    </div>
  );
}