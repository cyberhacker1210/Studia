'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { getUserCourses, deleteCourse, updateCourse, Course } from '@/lib/courseService';
import { PWAService } from '@/lib/pwaService'; // ✅ Import du service Offline
import {
  BookOpen, Trash2, Calendar, Plus, ArrowRight, Edit2,
  Check, X, Search, MoreVertical, Calculator, FlaskConical, Globe,
  Book, Coins, Languages, Terminal, HelpCircle, Layers, Filter, ChevronDown, WifiOff
} from 'lucide-react';
import Link from 'next/link';

// Config Visuelle
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
  const [isOffline, setIsOffline] = useState(false); // ✅ État Offline

  // Filtres
  const [selectedSubject, setSelectedSubject] = useState("Tous");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  // Édition
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");

  useEffect(() => {
    // Initial load
    if (user) loadData();

    // Listeners réseau
    const handleOnline = () => { setIsOffline(false); loadData(); };
    const handleOffline = () => { setIsOffline(true); loadData(); };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
    };
  }, [user]);

  const loadData = async () => {
      setLoading(true);
      if (navigator.onLine) {
          try {
              // EN LIGNE : API + Sync locale
              const data = await getUserCourses(user!.id);
              setCourses(data);
              setIsOffline(false);
              // Sauvegarde silencieuse pour plus tard
              data.forEach(c => PWAService.saveCourseOffline(c));
          } catch (e) {
              console.error("Erreur sync API, passage en mode cache", e);
              loadLocalData(); // Fallback si l'API échoue
          }
      } else {
          loadLocalData();
      }
      setLoading(false);
  };

  const loadLocalData = async () => {
      setIsOffline(true);
      const localData = await PWAService.getAllCoursesOffline();
      setCourses(localData);
  };

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
    if (isOffline) return alert("Impossible de supprimer hors ligne");
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
      if (isOffline) return alert("Impossible de modifier hors ligne");
      if(user && editingId) {
          await updateCourse(editingId, user.id, { title: editTitle });
          setCourses(courses.map(c => c.id === editingId ? { ...c, title: editTitle } : c));
          setEditingId(null);
      }
  };

  return (
    <div className="pb-32 px-6 max-w-7xl mx-auto min-h-screen" onClick={() => { setMenuOpenId(null); setShowFilterMenu(false); }}>

      {/* BANNIÈRE HORS LIGNE */}
      {isOffline && (
          <div className="bg-orange-50 border-b border-orange-100 text-orange-700 px-4 py-3 flex items-center justify-center gap-2 text-sm font-bold sticky top-0 z-50 -mx-6 mb-6">
              <WifiOff size={16} /> Mode Hors Ligne - Vous consultez vos cours sauvegardés
          </div>
      )}

      {/* HEADER COMPACT */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 pt-4 gap-4">
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

              {/* Filtre Dropdown */}
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
                                  {sub}
                              </button>
                          ))}
                      </div>
                  )}
              </div>

              {!isOffline && (
                  <Link href="/workspace/capture" className="btn-b-primary py-2.5 px-5 shadow-sm hover:shadow-md transition-all whitespace-nowrap">
                      <Plus size={18} /> Nouveau
                  </Link>
              )}
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
                  const config = SUBJECT_CONFIG[subject] || SUBJECT_CONFIG["Autre"];

                  return (
                      <Link href={`/workspace/courses/${course.id}`} key={course.id} className="group relative block">
                          <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-blue-300 hover:shadow-md transition-all duration-200 h-full flex flex-col relative overflow-hidden">

                              {/* Bande Latérale Couleur */}
                              <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl ${config.bg}`}></div>

                              <div className="pl-3 flex justify-between items-start mb-2">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                      {subject}
                                  </span>
                                  {!isOffline && (
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
                                  )}
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