'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { getUserCourses, deleteCourse, updateCourse, Course } from '@/lib/courseService';
import { BookOpen, Trash2, Calendar, Plus, ArrowRight, Edit2, Check, X, Filter, Tag } from 'lucide-react';
import Link from 'next/link';

const SUBJECTS = ["Tous", "Mathématiques", "Physique-Chimie", "SVT", "Histoire-Géo", "Philosophie", "Français", "Anglais", "Espagnol", "Autre"];

export default function CoursesPage() {
  const { user } = useUser();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState("Tous");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");

  useEffect(() => {
    if (user) {
      getUserCourses(user.id).then(data => {
        setCourses(data);
        setFilteredCourses(data);
        setLoading(false);
      });
    }
  }, [user]);

  useEffect(() => {
    if (selectedSubject === "Tous") {
      setFilteredCourses(courses);
    } else {
      setFilteredCourses(courses.filter(c => c.subject === selectedSubject));
    }
  }, [selectedSubject, courses]);

  const handleDelete = async (e: any, courseId: number) => {
    e.preventDefault(); e.stopPropagation();
    if (!confirm('Supprimer définitivement ?')) return;
    if (!user) return;
    await deleteCourse(courseId, user.id);
    setCourses(courses.filter(c => c.id !== courseId));
  };

  const startEdit = (e: any, course: Course) => {
      e.preventDefault(); e.stopPropagation();
      setEditingId(course.id);
      setEditTitle(course.title);
  };

  const saveEdit = async (e: any) => {
      e.preventDefault(); e.stopPropagation();
      if (!user || !editingId) return;
      await updateCourse(editingId, user.id, { title: editTitle });
      setCourses(courses.map(c => c.id === editingId ? { ...c, title: editTitle } : c));
      setEditingId(null);
  };

  const gradients = [
    "from-blue-500 to-indigo-600", "from-purple-500 to-pink-600",
    "from-emerald-400 to-teal-600", "from-orange-400 to-red-500"
  ];

  return (
    <div className="pb-20 px-4 max-w-7xl mx-auto">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Mes Cours</h1>
            <p className="text-slate-500 font-medium">Organisés pour la réussite.</p>
          </div>
          <Link href="/workspace/capture" className="btn-b-primary py-3 px-6 shadow-lg hover:scale-105 transition-transform">
              <Plus size={20} /> Nouveau Cours
          </Link>
      </div>

      {/* TABS FILTRES */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide">
          <div className="flex items-center gap-2 text-slate-400 mr-2 shrink-0">
              <Filter size={16} /> <span className="text-xs font-bold uppercase">Matières</span>
          </div>
          {SUBJECTS.map(sub => (
              <button
                key={sub}
                onClick={() => setSelectedSubject(sub)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-all border ${
                    selectedSubject === sub 
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
                }`}
              >
                  {sub}
              </button>
          ))}
      </div>

      {/* GRILLE COURS */}
      {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3].map(i => <div key={i} className="h-64 bg-slate-100 rounded-[2rem] animate-pulse"></div>)}
          </div>
      ) : filteredCourses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white border-2 border-dashed border-slate-200 rounded-[2rem] text-center p-6">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                  <BookOpen size={32} className="text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Aucun cours ici.</h3>
              <p className="text-slate-500 mb-8 max-w-xs mx-auto">
                  {selectedSubject === "Tous" ? "Ajoutez votre premier cours." : `Pas encore de cours en ${selectedSubject}.`}
              </p>
              {selectedSubject === "Tous" && (
                  <Link href="/workspace/capture" className="btn-b-primary text-sm py-3 px-8">
                      Créer un cours
                  </Link>
              )}
          </div>
      ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
              {filteredCourses.map((course, index) => {
                  const gradient = gradients[index % gradients.length];

                  return (
                    <Link href={`/workspace/courses/${course.id}`} key={course.id} className="group relative block h-full">
                        <div className={`h-full min-h-[280px] rounded-[2rem] p-6 flex flex-col justify-between text-white shadow-lg bg-gradient-to-br ${gradient} transition-transform active:scale-95 hover:-translate-y-2 relative overflow-hidden`}>
                            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-12 -mt-12 blur-2xl"></div>

                            <div className="relative z-10 flex justify-between items-start">
                                <div className="flex flex-col gap-2">
                                    <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide w-fit border border-white/10 flex items-center gap-1">
                                        <Tag size={10}/> {course.subject || 'Général'}
                                    </div>
                                    <div className="flex items-center gap-1 text-xs font-medium text-white/80">
                                        <Calendar size={12}/> {new Date(course.created_at).toLocaleDateString()}
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button onClick={(e) => startEdit(e, course)} className="p-2 bg-black/20 hover:bg-black/40 rounded-xl transition-colors backdrop-blur-sm"><Edit2 size={16} /></button>
                                    <button onClick={(e) => handleDelete(e, course.id)} className="p-2 bg-black/20 hover:bg-red-500/80 rounded-xl transition-colors backdrop-blur-sm"><Trash2 size={16} /></button>
                                </div>
                            </div>

                            <div className="relative z-10 mt-4 mb-4 flex-1">
                                {editingId === course.id ? (
                                    <div onClick={(e) => e.preventDefault()} className="flex flex-col gap-2">
                                        <input
                                            type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)}
                                            className="w-full bg-white/20 text-white p-2 rounded-lg outline-none font-bold border border-white/30"
                                            autoFocus onClick={(e) => e.stopPropagation()}
                                        />
                                        <div className="flex gap-2">
                                            <button onClick={saveEdit} className="bg-green-500 p-1.5 rounded-lg"><Check size={14}/></button>
                                            <button onClick={(e) => { e.preventDefault(); setEditingId(null); }} className="bg-red-500 p-1.5 rounded-lg"><X size={14}/></button>
                                        </div>
                                    </div>
                                ) : (
                                    <h3 className="text-2xl font-black leading-tight mb-2 line-clamp-3 drop-shadow-sm">{course.title}</h3>
                                )}
                            </div>

                            <div className="relative z-10 flex items-center gap-2 text-sm font-bold bg-white/10 backdrop-blur-md p-3 rounded-xl w-fit group-hover:bg-white/20 transition-colors border border-white/10">
                                Ouvrir <ArrowRight size={16}/>
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