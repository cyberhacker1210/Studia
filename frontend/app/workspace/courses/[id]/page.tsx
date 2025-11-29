'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { getCourseById, Course } from '@/lib/courseService';
import { ArrowLeft, Brain, Zap, FileText, Loader2, ChevronRight, Sparkles, Play, ArrowRight, X } from 'lucide-react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';

export default function CourseDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useUser();
  const [course, setCourse] = useState<Course | null>(null);
  const [showTextModal, setShowTextModal] = useState(false);

  useEffect(() => {
    if (user && id) getCourseById(Number(id), user.id).then(setCourse);
  }, [user, id]);

  if (!course) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-slate-900" /></div>;

  const ActionCard = ({ icon: Icon, title, desc, color, href, primary = false }: any) => (
     <Link href={href} className={`group relative overflow-hidden p-8 rounded-[2rem] transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between h-72 border-2 ${primary ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200' : 'bg-white border-slate-100 hover:border-slate-300 hover:shadow-lg'}`}>
         {primary && <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-12 -mt-12 blur-3xl"></div>}

         <div>
             <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${primary ? 'bg-white/20 text-white backdrop-blur-md' : `bg-${color}-50 text-${color}-600`}`}>
                 <Icon size={32} strokeWidth={2.5} />
             </div>
             <h3 className="text-2xl font-extrabold mb-2">{title}</h3>
             <p className={`font-medium text-lg leading-relaxed ${primary ? 'text-slate-300' : 'text-slate-500'}`}>{desc}</p>
         </div>

         <div className="flex items-center gap-3 font-bold mt-6">
             <span>Commencer</span>
             <div className={`w-8 h-8 rounded-full flex items-center justify-center ${primary ? 'bg-white text-slate-900' : 'bg-slate-100 text-slate-900'} group-hover:translate-x-2 transition-transform`}>
                <ChevronRight size={16} strokeWidth={3} />
             </div>
         </div>
     </Link>
  );

  return (
    <div className="pb-20">
        {/* NAV */}
        <button onClick={() => router.push('/workspace/courses')} className="group flex items-center gap-3 text-slate-500 hover:text-slate-900 mb-8 font-bold text-sm transition-colors">
            <div className="w-10 h-10 rounded-full border-2 border-slate-100 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
                <ArrowLeft size={18} />
            </div>
            Retour à la bibliothèque
        </button>

        {/* HEADER */}
        <div className="mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6 border border-blue-100">
                <Sparkles size={12}/> Cours IA
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 leading-tight tracking-tight">{course.title}</h1>
            <p className="text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">
                Choisissez un mode d'apprentissage pour mémoriser ce contenu.
            </p>
        </div>

        {/* ACTIONS */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
            <div className="md:col-span-3">
                <Link href={`/workspace/courses/${id}/mastery`} className="relative overflow-hidden bg-slate-900 rounded-[2.5rem] p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl shadow-slate-200 group cursor-pointer hover:-translate-y-1 transition-transform">
                    <div className="relative z-10 flex-1">
                        <div className="flex items-center gap-3 text-yellow-400 font-black uppercase tracking-widest text-sm mb-4">
                            <Play size={16} fill="currentColor" /> Recommandé
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Mode Parcours</h2>
                        <p className="text-slate-300 text-lg font-medium max-w-xl">
                            L'expérience complète : Lecture, Quiz et Pratique guidée par l'IA.
                        </p>
                    </div>
                    <div className="relative z-10 bg-white text-slate-900 px-8 py-4 rounded-2xl font-bold text-lg flex items-center gap-3 group-hover:scale-105 transition-transform">
                        Lancer <ArrowRight strokeWidth={3} />
                    </div>
                </Link>
            </div>

            <ActionCard title="Flashcards" desc="Mémorisation active." icon={Zap} color="amber" href={`/workspace/courses/${id}/generate-flashcards`} />
            <ActionCard title="Quiz Express" desc="Testez vos connaissances." icon={Brain} color="purple" href={`/workspace/courses/${id}/generate-quiz`} />

            {/* READ CARD - Connecté au Modal */}
            <div className="bg-white border-2 border-slate-100 rounded-[2rem] p-8 flex flex-col">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                    <FileText size={32} strokeWidth={2.5} />
                </div>
                <h3 className="text-2xl font-extrabold text-slate-900 mb-2">Le Contenu</h3>
                <p className="text-slate-500 font-medium mb-6 flex-1">Lire le texte brut du cours.</p>
                <button onClick={() => setShowTextModal(true)} className="w-full btn-b-secondary text-sm">
                    Lire le texte
                </button>
            </div>
        </div>

        {/* MODAL LECTURE */}
        {showTextModal && (
            <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in">
                <div className="bg-white w-full max-w-3xl max-h-[85vh] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-8">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white z-10">
                        <h2 className="text-xl font-bold text-slate-900">Texte du cours</h2>
                        <button onClick={() => setShowTextModal(false)} className="p-2 hover:bg-slate-100 rounded-full"><X size={24}/></button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-8 prose prose-slate max-w-none">
                        <ReactMarkdown>{course.extracted_text}</ReactMarkdown>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
}