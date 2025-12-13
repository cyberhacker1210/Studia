'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { getUserCourses, deleteCourse, updateCourse, Course } from '@/lib/courseService';
import {
  BookOpen, Trash2, Calendar, Plus, ArrowRight, Edit2,
  Check, X, Search, MoreVertical, Calculator, FlaskConical, Globe,
  Book, Coins, Languages, Terminal, HelpCircle, Layers, Filter
} from 'lucide-react';
import Link from 'next/link';

const SUBJECT_CONFIG: Record<string, { icon: any, color: string, bg: string }> = {
  "Mathématiques": { icon: Calculator, color: "text-blue-600", bg: "bg-blue-50" },
  "Physique-Chimie": { icon: FlaskConical, color: "text-purple-600", bg: "bg-purple-50" },
  "SVT": { icon: FlaskConical, color: "text-green-600", bg: "bg-green-50" },
  "Histoire-Géo": { icon: Globe, color: "text-amber-600", bg: "bg-amber-50" },
  "Philosophie": { icon: Book, color: "text-rose-600", bg: "bg-rose-50" },
  "Français": { icon: Book, color: "text-pink-600", bg: "bg-pink-50" },
  "Anglais": { icon: Languages, color: "text-sky-600", bg: "bg-sky-50" },
  "Espagnol": { icon: Languages, color: "text-orange-600", bg: "bg-orange-50" },
  "Autre": { icon: HelpCircle, color: "text-slate-500", bg: "bg-slate-100" },
  "Général": { icon: Layers, color: "text-indigo-600", bg: "bg-indigo-50" }
};

const SUBJECTS = ["Tous", "Mathématiques", "Physique-Chimie", "SVT", "Histoire-Géo", "Philosophie", "Français", "Anglais", "Espagnol", "Autre"];

export default function CoursesPage() {
  const { user } = useUser();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState("Tous");
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);
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
    let result = courses;
    if (selectedSubject !== "Tous") {
      result = result.filter(c => (c.subject || "Général") === selectedSubject);
    }
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      result = result.filter(c => c.title.toLowerCase().includes(query));
    }
    setFilteredCourses(result);
  }, [selectedSubject, searchQuery, courses]);

  const handleDelete = async (e: any, id: number) => {
    e.preventDefault(); e.stopPropagation();
    if (confirm('Supprimer ?')) {
        await deleteCourse(id, user!.id);
        setCourses(courses.filter(c => c.id !== id));
    }
  };

  const startEdit = (e: any, c: Course) => {
      e.preventDefault(); e.stopPropagation();
      setEditingId(c.id);
      setEditTitle(c.title);
      setMenuOpenId(null);
  };

  const saveEdit = async (e: any) => {
      e.preventDefault(); e.stopPropagation();
      if(user && editingId) {
          await updateCourse(editingId, user.id, { title: editTitle });
          setCourses(courses.map(c => c.id === editingId ? { ...c, title: editTitle } : c));
          setEditingId(null);
      }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-blue-600 rounded-full border-t-transparent"></div></div>;

  return (
    <div className="pb-32 px-4 md:px-6 max-w-7xl mx-auto min-h-screen" onClick={() => setMenuOpenId(null)}>

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pt-6 gap-4">
          <h1 className="text-3xl font-black text-slate-900">Mes Cours</h1>

          <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
              {/* Recherche */}
              <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl font-medium text-slate-700 outline-none focus:border-blue-500 transition-colors shadow-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
              </div>

              {/* Filtre Mobile (Select) */}
              <div className="relative md:hidden">
                  <select
                    className="w-full appearance-none bg-white border border-slate-200 text-slate-700 py-3 pl-4 pr-10 rounded-xl font-bold focus:border-blue-500 outline-none shadow-sm"
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                  >
                      {SUBJECTS.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                  </select>
                  <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18}/>
              </div>

              {/* Filtre Desktop (Boutons) - Caché sur mobile */}
              <div className="hidden md:flex items-center gap-2">
                  <div className="relative group">
                      <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-3 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm whitespace-nowrap">
                          <Filter size={18}/> {selectedSubject === "Tous" ? "Matière" : selectedSubject}
                      </button>
                      <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-xl overflow-hidden z-50 hidden group-hover:block">
                          {SUBJECTS.map(sub => (
                              <button key={sub} onClick={() => setSelectedSubject(sub)} className="w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-slate-50 text-slate-600 block">
                                  {sub}
                              </button>
                          ))}
                      </div>
                  </div>
              </div>

              <Link href="/workspace/capture" className="btn-b-primary py-3 px-5 shadow-md flex justify-center w-full sm:w-auto">
                  <Plus size={20} /> Nouveau
              </Link>
          </div>
      </div>

      {/* GRILLE */}
      {filteredCourses.length === 0 ? (
          <div className="text-center py-20 bg-white border-2 border-dashed border-slate-200 rounded-3xl mt-4">
              <BookOpen size={40} className="mx-auto mb-4 text-slate-300"/>
              <p className="text-slate-500 font-medium">Aucun cours trouvé.</p>
          </div>
      ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-in fade-in">
              {filteredCourses.map(course => {
                  const subject = course.subject || "Général";
                  const config = SUBJECT_CONFIG[subject] || SUBJECT_CONFIG["Autre"];
                  const Icon = config.icon;

                  return (
                      <Link href={`/workspace/courses/${course.id}`} key={course.id} className="group relative block">
                          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm active:scale-[0.98] transition-all duration-200 h-full flex flex-col relative overflow-hidden">
                              <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl ${config.bg.replace('bg-', 'bg-')}`}></div> {/* Bande couleur */}

                              <div className="pl-3 flex justify-between items-start mb-3">
                                  <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${config.bg} ${config.color}`}>
                                      {subject}
                                  </span>
                                  <div className="relative">
                                      <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMenuOpenId(menuOpenId === course.id ? null : course.id); }} className="p-1 text-slate-300 hover:text-slate-600">
                                          <MoreVertical size={18} />
                                      </button>
                                      {menuOpenId === course.id && (
                                          <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-xl border border-slate-100 z-20 overflow-hidden">
                                              <button onClick={(e) => startEdit(e, course)} className="w-full text-left px-3 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 flex gap-2 border-b border-slate-50"><Edit2 size={14}/> Renommer</button>
                                              <button onClick={(e) => handleDelete(e, course.id)} className="w-full text-left px-3 py-3 text-xs font-bold text-red-600 hover:bg-red-50 flex gap-2"><Trash2 size={14}/> Supprimer</button>
                                          </div>
                                      )}
                                  </div>
                              </div>

                              <div className="pl-3 flex-1 mb-4">
                                  {editingId === course.id ? (
                                      <div className="flex gap-2 items-center" onClick={e => e.preventDefault()}>
                                          <input autoFocus className="w-full font-bold text-base border-b-2 border-blue-500 outline-none pb-1" value={editTitle} onChange={e => setEditTitle(e.target.value)} onClick={e => e.stopPropagation()} />
                                          <button onClick={saveEdit} className="text-green-600"><Check size={16}/></button>
                                      </div>
                                  ) : (
                                      <h3 className="font-extrabold text-slate-900 text-lg leading-snug line-clamp-2">{course.title}</h3>
                                  )}
                              </div>

                              <div className="pl-3 pt-3 border-t border-slate-50 flex justify-between items-center text-xs text-slate-400 font-medium">
                                  <span className="flex items-center gap-1"><Calendar size={12}/> {new Date(course.created_at).toLocaleDateString()}</span>
                                  <ArrowRight size={14} className="text-slate-300"/>
                              </div>
                          </div>
                      </Link>
                  );
              })}
          </div>
      )}
    </div>
  );
}