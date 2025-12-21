'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { getCourseById, Course } from '@/lib/courseService';
import {
    ArrowLeft, Brain, Zap, Loader2, ChevronRight,
    Sparkles, Play, X, BookOpen, Calendar, ArrowRight,
    AlignLeft, List, Type, Minus, Plus, Clock, FileText, Target
} from 'lucide-react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';

// Fonction pour extraire le sommaire du Markdown
const extractHeadings = (markdown: string) => {
    const lines = markdown.split('\n');
    const headings = [];
    let idCounter = 0;

    for (const line of lines) {
        if (line.startsWith('# ')) {
            headings.push({ id: `section-${idCounter++}`, text: line.replace('# ', ''), level: 1 });
        } else if (line.startsWith('## ')) {
            headings.push({ id: `section-${idCounter++}`, text: line.replace('## ', ''), level: 2 });
        } else if (line.startsWith('### ')) {
            headings.push({ id: `section-${idCounter++}`, text: line.replace('### ', ''), level: 3 });
        }
    }
    return headings;
};

export default function CourseDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useUser();
  const [course, setCourse] = useState<Course | null>(null);

  // États Lecteur
  const [showReader, setShowReader] = useState(false);
  const [fontSize, setFontSize] = useState(18);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [headings, setHeadings] = useState<any[]>([]);
  const [showToc, setShowToc] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user && id) {
        getCourseById(Number(id), user.id).then(data => {
            setCourse(data);
            if (data.extracted_text) {
                setHeadings(extractHeadings(data.extracted_text));
            }
        });
    }
  }, [user, id]);

  const handleScroll = () => {
      if (contentRef.current) {
          const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
          const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
          setScrollProgress(progress);
      }
  };

  const scrollToSection = (id: string) => {
      const element = document.getElementById(id);
      if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
  };

  if (!course) return <div className="flex h-screen items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-slate-900" /></div>;

  const readTime = Math.ceil(course.extracted_text.split(/\s+/).length / 200);

  // Composant Carte Action Reutilisable
  const ActionCard = ({ icon: Icon, title, desc, color, href }: any) => (
     <Link href={href} className="group bg-white border border-slate-200 rounded-[2rem] p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-64 relative overflow-hidden">
         <div className={`absolute top-0 right-0 w-32 h-32 bg-${color}-50 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-150`}></div>

         <div className="relative z-10">
             <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 bg-${color}-50 text-${color}-600 group-hover:bg-${color}-600 group-hover:text-white transition-colors`}>
                 <Icon size={28} strokeWidth={2} />
             </div>
             <h3 className="text-xl font-bold text-slate-900 mb-1">{title}</h3>
             <p className="text-sm text-slate-500 font-medium leading-relaxed">{desc}</p>
         </div>

         <div className="relative z-10 flex items-center gap-2 text-sm font-bold text-slate-900 mt-4 group-hover:gap-3 transition-all">
             <span>Ouvrir</span>
             <ChevronRight size={16} strokeWidth={3} className={`text-${color}-500`}/>
         </div>
     </Link>
  );

  return (
    <div className="pb-20 px-4 md:px-8 max-w-7xl mx-auto pt-8">

        {/* Navigation */}
        <button onClick={() => router.push('/workspace/courses')} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold text-sm mb-8 transition-colors">
            <ArrowLeft size={18} /> Retour
        </button>

        {/* HEADER IMMERSIF */}
        <div className="relative bg-slate-900 rounded-[2.5rem] p-8 md:p-12 mb-12 overflow-hidden shadow-2xl shadow-slate-200">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600 rounded-full blur-[100px] opacity-20 -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-600 rounded-full blur-[80px] opacity-20 -ml-20 -mb-20"></div>

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 rounded-full border border-white/20 text-white/90 text-xs font-black uppercase tracking-widest bg-white/5 backdrop-blur-md">
                        {course.subject || 'Général'}
                    </span>
                    <span className="text-white/50 text-xs font-bold flex items-center gap-1">
                        <Calendar size={12}/> {new Date(course.created_at).toLocaleDateString()}
                    </span>
                </div>

                <h1 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight tracking-tight">
                    {course.title}
                </h1>
            </div>
        </div>

        {/* GRILLE D'ACTIONS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">

            {/* 1. PARCOURS (Carte Large) */}
            <Link href={`/workspace/courses/${id}/mastery`} className="col-span-1 md:col-span-2 bg-white border border-slate-200 rounded-[2rem] p-8 hover:border-blue-500 hover:shadow-xl transition-all group flex flex-col justify-between min-h-[300px] relative overflow-hidden">
                <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                            <Play size={24} fill="currentColor" />
                        </div>
                        <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">Recommandé</span>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mb-2">Parcours 20/20</h3>
                    <p className="text-slate-500 font-medium max-w-md text-lg">Le chemin guidé vers l'excellence. Apprends, mémorise et valide chaque notion.</p>
                </div>
                <div className="relative z-10 flex items-center gap-2 text-blue-600 font-bold mt-8 group-hover:translate-x-2 transition-transform">
                    Lancer la session <ArrowRight size={20} strokeWidth={3} />
                </div>
            </Link>

            {/* 2. LECTEUR ZEN */}
            <div onClick={() => setShowReader(true)} className="bg-white border border-slate-200 rounded-[2rem] p-8 hover:border-slate-400 hover:shadow-xl transition-all group cursor-pointer flex flex-col justify-between h-full min-h-[300px]">
                <div>
                    <div className="w-12 h-12 bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center mb-4 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                        <AlignLeft size={24} />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-2">Lecteur Zen</h3>
                    <p className="text-sm text-slate-500 font-medium">Lecture optimisée et confort visuel. {readTime} min.</p>
                </div>
                <button className="w-full py-3 bg-slate-50 text-slate-600 rounded-xl font-bold text-sm group-hover:bg-slate-900 group-hover:text-white transition-colors">
                    Lire le cours
                </button>
            </div>

            {/* LIGNE 2 */}
            <ActionCard title="Fiche Synthèse" desc="L'essentiel en une page." icon={FileText} color="blue" href={`/workspace/courses/${id}/summary`} />
            <ActionCard title="S'exercer" desc="Entraînement infini corrigé." icon={Target} color="green" href={`/workspace/courses/${id}/practice`} />
            <ActionCard title="Flashcards" desc="Mémorisation active." icon={Zap} color="amber" href={`/workspace/courses/${id}/generate-flashcards`} />

            {/* LIGNE 3 */}
            <ActionCard title="Quiz Express" desc="Testez vos connaissances." icon={Brain} color="purple" href={`/workspace/courses/${id}/generate-quiz`} />
        </div>

        {/* --- LECTEUR PRO V2 (Intégré) --- */}
        {showReader && (
            <div className="fixed inset-0 bg-white z-[100] flex flex-col animate-in slide-in-from-bottom duration-300">
                <div className="h-1 bg-slate-100 w-full"><div className="h-full bg-blue-600 transition-all duration-100 ease-out" style={{ width: `${scrollProgress}%` }}></div></div>

                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white/95 backdrop-blur sticky top-0 z-20 shadow-sm">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setShowReader(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors group"><X size={24} className="text-slate-400 group-hover:text-slate-900"/></button>
                        <button onClick={() => setShowToc(!showToc)} className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${showToc ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                            <List size={16}/> Sommaire
                        </button>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl">
                        <button onClick={() => setFontSize(s => Math.max(14, s - 2))} className="p-2 hover:bg-white rounded-lg text-slate-500 hover:text-slate-900 transition-all"><Minus size={16} /></button>
                        <div className="flex items-center gap-1.5 px-2 text-xs font-bold text-slate-500 select-none"><Type size={14} /> {fontSize}px</div>
                        <button onClick={() => setFontSize(s => Math.min(24, s + 2))} className="p-2 hover:bg-white rounded-lg text-slate-500 hover:text-slate-900 transition-all"><Plus size={16} /></button>
                    </div>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* SOMMAIRE (Desktop) */}
                    <div className={`w-72 border-r border-slate-100 bg-slate-50 overflow-y-auto p-6 transition-all duration-300 hidden md:block ${showToc ? 'translate-x-0' : '-ml-72'}`}>
                        <h3 className="font-black text-slate-900 text-sm uppercase tracking-widest mb-6">Plan du cours</h3>
                        <div className="space-y-1">
                            {headings.length === 0 ? <p className="text-slate-400 text-sm">Aucun titre détecté</p> : headings.map((h, i) => (
                                <button key={i} onClick={() => scrollToSection(h.id)} className={`text-left w-full text-sm py-2 px-3 rounded-lg hover:bg-white hover:text-blue-600 transition-colors ${h.level === 1 ? 'font-bold text-slate-800' : 'text-slate-500 pl-6'}`}>
                                    {h.text}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* TEXTE */}
                    <div ref={contentRef} onScroll={handleScroll} className="flex-1 overflow-y-auto bg-white scroll-smooth">
                        <div className="max-w-3xl mx-auto py-20 px-8 lg:px-16 min-h-full">
                            <div className="mb-12 text-center border-b border-slate-100 pb-12">
                                <h1 className="text-4xl md:text-5xl font-serif font-black text-slate-900 leading-tight">{course.title}</h1>
                            </div>
                            <div style={{ fontSize: `${fontSize}px` }} className="text-slate-800 font-serif leading-loose">
                                <ReactMarkdown components={{
                                    h1: ({node, children, ...props}) => { const id = headings.find(h => h.text === String(children))?.id; return <h1 id={id} className="text-3xl font-sans font-black mt-16 mb-6 text-slate-900" {...props}>{children}</h1> },
                                    h2: ({node, children, ...props}) => { const id = headings.find(h => h.text === String(children))?.id; return <h2 id={id} className="text-2xl font-sans font-bold mt-12 mb-4 text-slate-900 border-l-4 border-blue-500 pl-4" {...props}>{children}</h2> },
                                    h3: ({node, children, ...props}) => { const id = headings.find(h => h.text === String(children))?.id; return <h3 id={id} className="text-xl font-sans font-bold mt-10 mb-3 text-slate-800" {...props}>{children}</h3> },
                                    p: ({node, ...props}) => <p className="mb-6 leading-loose text-slate-700" {...props} />,
                                    ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-6 space-y-2 marker:text-blue-500" {...props} />,
                                    ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-6 space-y-2 marker:font-bold marker:text-slate-900" {...props} />,
                                    blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-yellow-400 bg-yellow-50 p-6 my-8 rounded-r-xl font-serif italic text-slate-800" {...props} />,
                                    code: ({node, className, children, ...props}: any) => {
                                        const match = /language-(\w+)/.exec(className || '')
                                        if (match) return <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl overflow-x-auto my-6 font-mono text-sm shadow-lg border border-slate-700"><code className={className} {...props}>{children}</code></pre>
                                        return <code className="bg-slate-100 text-pink-600 px-1.5 py-0.5 rounded text-[0.9em] font-mono font-bold border border-slate-200" {...props}>{children}</code>
                                    },
                                }}>{course.extracted_text}</ReactMarkdown>
                            </div>
                            <div className="mt-24 pt-12 border-t border-slate-100 text-center">
                                <button onClick={() => setShowReader(false)} className="btn-b-primary px-10 py-4 mx-auto shadow-xl">Terminer la lecture</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
}