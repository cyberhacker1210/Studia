'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { getCourseById, Course } from '@/lib/courseService';
import { ArrowLeft, Brain, Zap, FileText, Loader2, ChevronRight, Sparkles, Play, X, BookOpen, Calendar, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown'; // Assure-toi d'avoir npm install react-markdown

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
        <button onClick={() => router.push('/workspace/courses')} className="group flex items-center gap-3 text-slate-500 hover:text-slate-900 mb-10 font-bold text-sm transition-colors">
            <div className="w-10 h-10 rounded-full border-2 border-slate-100 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all bg-white">
                <ArrowLeft size={18} />
            </div>
            Retour à la bibliothèque
        </button>

        {/* HEADER */}
        <div className="mb-16">
            <div className="flex items-center gap-3 mb-6">
                <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-blue-100">
                    <Sparkles size={12}/> Cours IA
                </div>
                <span className="text-slate-400 text-xs font-bold flex items-center gap-1 uppercase tracking-wider">
                    <Calendar size={12}/> {new Date(course.created_at).toLocaleDateString()}
                </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 leading-tight tracking-tight">{course.title}</h1>
            <p className="text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">
                Choisissez un mode d'apprentissage pour mémoriser ce contenu efficacement.
            </p>
        </div>

        {/* ACTIONS GRID */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">

            {/* 1. MASTERY */}
            <div className="md:col-span-3">
                <Link href={`/workspace/courses/${id}/mastery`} className="relative overflow-hidden bg-slate-900 rounded-[2.5rem] p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl shadow-slate-200 group cursor-pointer hover:-translate-y-1 transition-transform">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative z-10 flex-1">
                        <div className="flex items-center gap-3 text-yellow-400 font-black uppercase tracking-widest text-sm mb-4">
                            <Play size={16} fill="currentColor" /> Recommandé
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Mode Parcours</h2>
                        <p className="text-slate-300 text-lg font-medium max-w-xl">
                            L'expérience complète : Lecture progressive, Quiz de validation et Exercices pratiques guidés.
                        </p>
                    </div>
                    <div className="relative z-10 bg-white text-slate-900 px-8 py-4 rounded-2xl font-bold text-lg flex items-center gap-3 group-hover:scale-105 transition-transform shadow-xl">
                        Lancer la session <ArrowRight strokeWidth={3} />
                    </div>
                </Link>
            </div>

            {/* 2. Flashcards */}
            <ActionCard title="Flashcards" desc="Mémorisation active." icon={Zap} color="amber" href={`/workspace/courses/${id}/generate-flashcards`} />

            {/* 3. Quiz */}
            <ActionCard title="Quiz Express" desc="Testez vos connaissances." icon={Brain} color="purple" href={`/workspace/courses/${id}/generate-quiz`} />

            {/* 4. Lecture (Modal) */}
            <div
                onClick={() => setShowTextModal(true)}
                className="bg-white border-2 border-slate-100 rounded-[2rem] p-8 flex flex-col cursor-pointer hover:border-blue-300 hover:shadow-lg transition-all duration-300 group h-72"
            >
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <BookOpen size={32} strokeWidth={2.5} />
                </div>
                <h3 className="text-2xl font-extrabold text-slate-900 mb-2">Le Contenu</h3>
                <p className="text-slate-500 font-medium mb-6 flex-1">Lire le texte brut extrait.</p>

                <button className="w-full btn-b-secondary text-sm group-hover:bg-blue-50 group-hover:text-blue-700 group-hover:border-blue-200">
                    Lire le texte complet
                </button>
            </div>
        </div>

        {/* MODAL LECTURE AMÉLIORÉE */}
        {showTextModal && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
                <div className="bg-white w-full max-w-4xl h-[90vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 relative">

                    {/* Header Modal */}
                    <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white/80 backdrop-blur sticky top-0 z-10">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                                <FileText size={20} className="text-slate-600"/>
                            </div>
                            <div>
                                <h2 className="text-lg font-extrabold text-slate-900 leading-tight line-clamp-1">{course.title}</h2>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mode Lecture</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowTextModal(false)}
                            className="w-10 h-10 rounded-full bg-slate-100 hover:bg-red-50 hover:text-red-600 flex items-center justify-center transition-colors"
                        >
                            <X size={20}/>
                        </button>
                    </div>

                    {/* Content Scrollable */}
                    <div className="flex-1 overflow-y-auto p-8 md:p-12 bg-white">
                        <article className="prose prose-slate prose-lg max-w-none
                            prose-headings:font-black prose-headings:text-slate-900 prose-headings:tracking-tight
                            prose-p:text-slate-600 prose-p:leading-relaxed prose-p:font-medium
                            prose-strong:text-slate-900 prose-strong:font-extrabold
                            prose-li:text-slate-600
                            prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:not-italic
                        ">
                            <ReactMarkdown>{course.extracted_text}</ReactMarkdown>
                        </article>
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
                        <button
                            onClick={() => setShowTextModal(false)}
                            className="btn-b-primary px-8"
                        >
                            Fermer
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
}