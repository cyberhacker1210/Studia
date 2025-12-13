'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { getUserCourses, deleteCourse, updateCourse, Course } from '@/lib/courseService';
import {
  BookOpen, Trash2, Calendar, Plus, ArrowRight, Edit2,
  Check, X, Search, MoreVertical, Filter, ChevronDown
} from 'lucide-react';
import Link from 'next/link';

// Code couleur simple (Bande latérale)
const SUBJECT_COLORS: Record<string, string> = {
  "Mathématiques": "bg-blue-500",
  "Physique-Chimie": "bg-purple-500",
  "SVT": "bg-green-500",
  "Histoire-Géo": "bg-amber-500",
  "Philosophie": "bg-rose-500",
  "Français": "bg-pink-500",
  "Anglais": "bg-sky-500",
  "Espagnol": "bg-orange-500",
  "Autre": "bg-slate-400",
  "Général": "bg-indigo-500"
};

const SUBJECTS = ["Tous", "Mathématiques", "Physique-Chimie", "SVT", "Histoire-Géo", "Philosophie", "Français", "Anglais", "Espagnol", "Autre"];

export default function CoursesPage() {
  const { user } = useUser();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtres
  const [selectedSubject, setSelectedSubject] = useState("Tous");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  // Édition
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

  return (
    <div className="pb-32 px-6 max-w-7xl mx-auto min-h-screen" onClick={() => { setMenuOpenId(null); setShowFilterMenu(false); }}>

      {/* HEADER COMPACT */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 pt-8 gap-4">
          <h1 className="text-3xl font-black text-slate-900">Mes Cours</h1>

          <div className="flex gap-3 w-full md:w-auto">

              {/* Recherche */}
              <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl font-medium text-slate-700 outline-none focus:border-slate-400 transition-colors"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
              </div>

              {/* Filtre Dropdown (Discret) */}
              <div className="relative">
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowFilterMenu(!showFilterMenu); }}
                    className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-xl font-bold text-sm text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap"
                  >
                      <Filter size={16} />
                      {selectedSubject === "Tous" ? "Matière" : selectedSubject}
                      <ChevronDown size={14} className={`transition-transform ${showFilterMenu ? 'rotate-180' : ''}`} />
                  </button>

                  {showFilterMenu && (
                      <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-xl overflow-hidden z-50 animate-in zoom-in-95 origin-top-right">
                          {SUBJECTS.map(sub => (
                              <button
                                key={sub}
                                onClick={() => setSelectedSubject(sub)}
                                className={`w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-slate-50 flex items-center gap-2 ${selectedSubject === sub ? 'text-blue-600 bg-blue-50' : 'text-slate-600'}`}
                              >
                                  {sub !== "Tous" && <div className={`w-2 h-2 rounded-full ${SUBJECT_COLORS[sub] || 'bg-slate-400'}`}></div>}
                                  {sub}
                              </button>
                          ))}
                      </div>
                  )}
              </div>

              <Link href="/workspace/capture" className="btn-b-primary py-2.5 px-5 shadow-sm hover:shadow-md transition-all whitespace-nowrap">
                  <Plus size={18} /> Nouveau
              </Link>
          </div>
      </div>

      {/* GRILLE ÉPURÉE */}
      {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1,2,3,4].map(i => <div key={i} className="h-40 bg-slate-100 rounded-2xl animate-pulse"></div>)}
          </div>
      ) : filteredCourses.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
              <BookOpen size={48} className="mx-auto mb-4 opacity-20"/>
              <p>Aucun cours trouvé.</p>
          </div>
      ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-in fade-in">
              {filteredCourses.map(course => {
                  const subject = course.subject || "Général";
                  const colorClass = SUBJECT_COLORS[subject] || SUBJECT_COLORS["Autre"];

                  return (
                      <Link href={`/workspace/courses/${course.id}`} key={course.id} className="group relative block">
                          <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-blue-300 hover:shadow-md transition-all duration-200 h-full flex flex-col relative overflow-hidden">

                              {/* Bande Latérale Couleur */}
                              <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${colorClass}`}></div>

                              <div className="pl-3 flex justify-between items-start mb-2">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                      {subject}
                                  </span>
                                  <div className="relative">
                                      <button
                                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMenuOpenId(menuOpenId === course.id ? null : course.id); }}
                                          className="text-slate-300 hover:text-slate-600 transition-colors"
                                      >
                                          <MoreVertical size={16} />
                                      </button>
                                      {menuOpenId === course.id && (
                                          <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-xl border border-slate-100 z-20 overflow-hidden">
                                              <button onClick={(e) => startEdit(e, course)} className="w-full text-left px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 flex gap-2"><Edit2 size={12}/> Renommer</button>
                                              <button onClick={(e) => handleDelete(e, course.id)} className="w-full text-left px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 flex gap-2"><Trash2 size={12}/> Supprimer</button>
                                          </div>
                                      )}
                                  </div>
                              </div>

                              <div className="pl-3 flex-1 mb-4">
                                  {editingId === course.id ? (
                                      <div className="flex gap-2 items-center" onClick={e => e.preventDefault()}>
                                          <input
                                              autoFocus
                                              className="w-full font-bold text-sm border-b-2 border-blue-500 outline-none pb-1"
                                              value={editTitle} onChange={e => setEditTitle(e.target.value)}
                                              onClick={e => e.stopPropagation()}
                                          />
                                          <button onClick={saveEdit} className="text-green-600"><Check size={14}/></button>
                                      </div>
                                  ) : (
                                      <h3 className="font-bold text-slate-900 text-lg leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
                                          {course.title}
                                      </h3>
                                  )}
                              </div>

                              <div className="pl-3 pt-3 border-t border-slate-50 flex justify-between items-center">
                                  <span className="text-xs text-slate-400 font-medium">
                                      {new Date(course.created_at).toLocaleDateString()}
                                  </span>
                                  <ArrowRight size={14} className="text-slate-300 group-hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 duration-300"/>
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