'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { getCourseById, Course } from '@/lib/courseService';
import {
    ArrowLeft, Brain, Zap, Loader2, ChevronRight,
    Sparkles, Play, X, BookOpen, Calendar, ArrowRight as ArrowIcon,
    AlignLeft, List, Type, Minus, Plus
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
  const [showToc, setShowToc] = useState(true); // Afficher sommaire
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

  if (!course) return <div className="flex h-screen items-center justify-center bg-white"><Loader2 className="animate-spin text-slate-900" /></div>;

  const readTime = Math.ceil(course.extracted_text.split(/\s+/).length / 200);

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
    <div className="pb-20 px-6 max-w-7xl mx-auto">
        <button onClick={() => router.push('/workspace/courses')} className="group flex items-center gap-3 text-slate-500 hover:text-slate-900 mb-10 font-bold text-sm transition-colors pt-8">
            <div className="w-10 h-10 rounded-full border-2 border-slate-100 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all bg-white"><ArrowLeft size={18} /></div> Retour
        </button>

        <div className="mb-16">
            <div className="flex items-center gap-3 mb-6">
                <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-blue-100">
                    <Sparkles size={12}/> {course.subject || 'Général'}
                </div>
                <span className="text-slate-400 text-xs font-bold flex items-center gap-1 uppercase tracking-wider"><Calendar size={12}/> {new Date(course.created_at).toLocaleDateString()}</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 leading-tight tracking-tight">{course.title}</h1>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
            <div className="md:col-span-3">
                <Link href={`/workspace/courses/${id}/mastery`} className="relative overflow-hidden bg-slate-900 rounded-[2.5rem] p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl shadow-slate-200 group cursor-pointer hover:-translate-y-1 transition-transform">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative z-10 flex-1">
                        <div className="flex items-center gap-3 text-yellow-400 font-black uppercase tracking-widest text-sm mb-4"><Play size={16} fill="currentColor" /> Recommandé</div>
                        <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Mode Parcours 20/20</h2>
                        <p className="text-slate-300 text-lg font-medium max-w-xl">L'expérience complète : Apprentissage, Mémorisation et Validation.</p>
                    </div>
                    <div className="relative z-10 bg-white text-slate-900 px-8 py-4 rounded-2xl font-bold text-lg flex items-center gap-3 group-hover:scale-105 transition-transform shadow-xl">Lancer <ArrowRightIcon strokeWidth={3} /></div>
                </Link>
            </div>
            <ActionCard title="Flashcards" desc="Mémorisation active." icon={Zap} color="amber" href={`/workspace/courses/${id}/generate-flashcards`} />
            <ActionCard title="Quiz Express" desc="Testez vos connaissances." icon={Brain} color="purple" href={`/workspace/courses/${id}/generate-quiz`} />
            <div onClick={() => setShowReader(true)} className="bg-white border-2 border-slate-100 rounded-[2rem] p-8 flex flex-col cursor-pointer hover:border-blue-300 hover:shadow-lg transition-all duration-300 group h-72">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors"><AlignLeft size={32} strokeWidth={2.5} /></div>
                <h3 className="text-2xl font-extrabold text-slate-900 mb-2">Mode Lecture</h3>
                <div className="flex items-center gap-2 text-slate-400 text-sm font-bold mb-6"><Clock size={16} /> {readTime} min de lecture</div>
                <button className="w-full btn-b-secondary text-sm group-hover:bg-blue-50 group-hover:text-blue-700 group-hover:border-blue-200">Lire le cours</button>
            </div>
        </div>

        {/* --- LECTEUR PRO V2 --- */}
        {showReader && (
            <div className="fixed inset-0 bg-white z-[100] flex flex-col animate-in slide-in-from-bottom duration-300">
                <div className="h-1 bg-slate-100 w-full"><div className="h-full bg-blue-600 transition-all duration-100 ease-out" style={{ width: `${scrollProgress}%` }}></div></div>

                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white/95 backdrop-blur sticky top-0 z-20 shadow-sm">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setShowReader(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors group"><X size={24} className="text-slate-400 group-hover:text-slate-900"/></button>

                        {/* Toggle Sommaire */}
                        <button
                            onClick={() => setShowToc(!showToc)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${showToc ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                        >
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

                    {/* SIDEBAR SOMMAIRE */}
                    <div className={`w-72 border-r border-slate-100 bg-slate-50 overflow-y-auto p-6 transition-all duration-300 hidden md:block ${showToc ? 'translate-x-0' : '-ml-72'}`}>
                        <h3 className="font-black text-slate-900 text-sm uppercase tracking-widest mb-6">Plan du cours</h3>
                        <div className="space-y-1">
                            {headings.length === 0 ? <p className="text-slate-400 text-sm">Aucun titre détecté</p> : headings.map((h, i) => (
                                <button
                                    key={i}
                                    onClick={() => scrollToSection(h.id)}
                                    className={`text-left w-full text-sm py-2 px-3 rounded-lg hover:bg-white hover:text-blue-600 transition-colors ${h.level === 1 ? 'font-bold text-slate-800' : 'text-slate-500 pl-6'}`}
                                >
                                    {h.text}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* TEXTE PRINCIPAL */}
                    <div ref={contentRef} onScroll={handleScroll} className="flex-1 overflow-y-auto bg-white scroll-smooth">
                        {/* Largeur augmentée (max-w-4xl) pour plus de confort */}
                        <div className="max-w-4xl mx-auto py-20 px-8 lg:px-16 min-h-full">
                            <div className="mb-12 text-center border-b border-slate-100 pb-12">
                                <h1 className="text-4xl md:text-6xl font-serif font-black text-slate-900 leading-tight">{course.title}</h1>
                            </div>

                            <div style={{ fontSize: `${fontSize}px` }} className="text-slate-800 font-serif leading-loose">
                                <ReactMarkdown
                                    components={{
                                        // On injecte les ID pour le scroll
                                        h1: ({node, children, ...props}) => {
                                            const id = headings.find(h => h.text === String(children))?.id;
                                            return <h1 id={id} className="text-3xl font-sans font-black mt-16 mb-6 text-slate-900" {...props}>{children}</h1>
                                        },
                                        h2: ({node, children, ...props}) => {
                                            const id = headings.find(h => h.text === String(children))?.id;
                                            return <h2 id={id} className="text-2xl font-sans font-bold mt-12 mb-4 text-slate-900 border-l-4 border-blue-500 pl-4" {...props}>{children}</h2>
                                        },
                                        h3: ({node, children, ...props}) => {
                                            const id = headings.find(h => h.text === String(children))?.id;
                                            return <h3 id={id} className="text-xl font-sans font-bold mt-10 mb-3 text-slate-800" {...props}>{children}</h3>
                                        },
                                        p: ({node, ...props}) => <p className="mb-6 leading-loose text-slate-700" {...props} />,
                                        ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-6 space-y-2 marker:text-blue-500" {...props} />,
                                        ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-6 space-y-2 marker:font-bold marker:text-slate-900" {...props} />,
                                        blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-yellow-400 bg-yellow-50 p-6 my-8 rounded-r-xl font-serif italic text-slate-800" {...props} />,
                                        code: ({node, className, children, ...props}: any) => {
                                            const match = /language-(\w+)/.exec(className || '')
                                            if (match) return <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl overflow-x-auto my-6 font-mono text-sm shadow-lg border border-slate-700"><code className={className} {...props}>{children}</code></pre>
                                            return <code className="bg-slate-100 text-pink-600 px-1.5 py-0.5 rounded text-[0.9em] font-mono font-bold border border-slate-200" {...props}>{children}</code>
                                        },
                                    }}
                                >
                                    {course.extracted_text}
                                </ReactMarkdown>
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