'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { getUserCourses, deleteCourse, Course } from '@/lib/courseService';
import { BookOpen, Trash2, Calendar, Plus, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function CoursesPage() {
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

  const handleDelete = async (e: any, courseId: number) => {
    e.preventDefault();
    if (!confirm('Supprimer ce cours ?')) return;
    if (!user) return;
    await deleteCourse(courseId, user.id);
    setCourses(courses.filter(c => c.id !== courseId));
  };

  // Palette de dégradés pour les cartes
  const gradients = [
    "from-blue-500 to-indigo-600",
    "from-purple-500 to-pink-600",
    "from-emerald-400 to-teal-600",
    "from-orange-400 to-red-500",
  ];

  return (
    <div className="pb-10">

      <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-black text-slate-900">Bibliothèque</h1>
          <Link href="/workspace/capture" className="btn-b-secondary text-xs py-2 px-4 hidden md:flex">
              <Plus size={16} /> Nouveau
          </Link>
      </div>

      {loading ? (
          <div className="grid md:grid-cols-3 gap-4">
              {[1,2,3].map(i => <div key={i} className="h-64 bg-white rounded-[2rem] animate-pulse"></div>)}
          </div>
      ) : courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white border-2 border-dashed border-slate-200 rounded-[2rem] text-center p-6">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <BookOpen size={28} className="text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">C'est vide ici.</h3>
              <p className="text-slate-500 text-sm mb-6">Capturez votre premier cours pour commencer.</p>
              <Link href="/workspace/capture" className="btn-b-primary text-sm py-3">
                  Créer un cours
              </Link>
          </div>
      ) : (
          /* CONTAINER SWIPE MOBILE (Inspiré Netflix/Spotify) */
          <div className="
            flex gap-4 overflow-x-auto snap-x snap-mandatory
            pb-8 -mx-4 px-4
            md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:p-0 md:mx-0
            scrollbar-hide
          ">
              {courses.map((course, index) => {
                  // Choix aléatoire (mais stable) du dégradé
                  const gradient = gradients[index % gradients.length];

                  return (
                    <Link
                        href={`/workspace/courses/${course.id}`}
                        key={course.id}
                        className="relative group flex-shrink-0 w-[85vw] md:w-auto snap-center"
                    >
                        {/* CARTE STYLE "COVER ART" */}
                        <div className={`h-72 md:h-80 rounded-[2rem] p-6 flex flex-col justify-between text-white shadow-lg bg-gradient-to-br ${gradient} transition-transform active:scale-95 md:hover:-translate-y-2`}>

                            {/* Top: Date + Delete */}
                            <div className="flex justify-between items-start">
                                <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide">
                                    {new Date(course.created_at).toLocaleDateString()}
                                </div>
                                <button
                                    onClick={(e) => handleDelete(e, course.id)}
                                    className="p-2 bg-black/10 hover:bg-black/30 rounded-full transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            {/* Middle: Big Title */}
                            <div>
                                <h3 className="text-3xl font-black leading-tight mb-2 line-clamp-3 drop-shadow-md">
                                    {course.title}
                                </h3>
                                <div className="h-1 w-12 bg-white/50 rounded-full"></div>
                            </div>

                            {/* Bottom: Action */}
                            <div className="flex items-center gap-2 text-sm font-bold bg-white/10 backdrop-blur-md p-3 rounded-xl w-fit">
                                Ouvrir le cours <ArrowRight size={16}/>
                            </div>
                        </div>
                    </Link>
                  )
              })}
          </div>
      )}
    </div>
  );
}