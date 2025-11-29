'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { getUserCourses, deleteCourse, Course } from '@/lib/courseService';
import { ArrowLeft, BookOpen, Trash2, Calendar, Plus } from 'lucide-react';
import Link from 'next/link';

export default function CoursesPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
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
    e.preventDefault(); // Empêcher le clic sur la carte
    if (!confirm('Supprimer ce cours ?')) return;
    if (!user) return;
    await deleteCourse(courseId, user.id);
    setCourses(courses.filter(c => c.id !== courseId));
  };

  return (
    <div className="pb-20">
      <div className="flex items-center justify-between mb-10">
          <div>
              <h1 className="text-4xl font-black text-slate-900 mb-2">Mes Cours</h1>
              <p className="text-slate-500 font-medium text-lg">Bibliothèque de connaissances</p>
          </div>
          <Link href="/workspace/capture" className="btn-b-primary hidden md:flex">
              <Plus size={20} /> Ajouter
          </Link>
      </div>

      {loading ? (
          <div className="grid md:grid-cols-3 gap-6">
              {[1,2,3].map(i => <div key={i} className="h-64 bg-slate-50 rounded-[2rem] animate-pulse"></div>)}
          </div>
      ) : courses.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem]">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <BookOpen size={32} className="text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">C'est un peu vide...</h3>
              <p className="text-slate-500 mb-8">Commencez par ajouter votre premier cours.</p>
              <Link href="/workspace/capture" className="btn-b-primary inline-flex">
                  Créer un cours
              </Link>
          </div>
      ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Carte "Ajouter" toujours en premier sur mobile */}
              <Link href="/workspace/capture" className="md:hidden flex flex-col items-center justify-center h-64 border-2 border-dashed border-slate-200 rounded-[2rem] text-slate-400 hover:text-slate-900 hover:border-slate-900 transition-colors">
                  <Plus size={40} />
                  <span className="font-bold mt-2">Nouveau</span>
              </Link>

              {courses.map((course) => (
                  <Link href={`/workspace/courses/${course.id}`} key={course.id} className="group bg-white border-2 border-slate-100 rounded-[2rem] p-8 hover:border-slate-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full min-h-[280px] relative">

                      <div className="flex justify-between items-start mb-6">
                          <div className="w-14 h-14 bg-slate-100 text-slate-900 rounded-2xl flex items-center justify-center font-black text-2xl group-hover:bg-slate-900 group-hover:text-white transition-colors">
                              {course.title.charAt(0).toUpperCase()}
                          </div>
                          <button
                            onClick={(e) => handleDelete(e, course.id)}
                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                          >
                              <Trash2 size={18} />
                          </button>
                      </div>

                      <h3 className="text-2xl font-extrabold text-slate-900 mb-3 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                          {course.title}
                      </h3>

                      <p className="text-slate-400 text-sm line-clamp-2 mb-6 flex-1 font-medium">
                          {course.extracted_text.substring(0, 100)}...
                      </p>

                      <div className="mt-auto pt-6 border-t-2 border-slate-50 flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wide">
                          <Calendar size={14}/>
                          <span>{new Date(course.created_at).toLocaleDateString()}</span>
                      </div>
                  </Link>
              ))}
          </div>
      )}
    </div>
  );
}