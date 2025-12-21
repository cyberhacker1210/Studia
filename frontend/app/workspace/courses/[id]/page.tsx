'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { getCourseById, Course } from '@/lib/courseService';
import {
    ArrowLeft, Brain, Zap, Loader2, ChevronRight,
    Sparkles, Play, X, BookOpen, Calendar, ArrowRight, // ✅ CORRECTION ICI
    AlignLeft, List, Type, Minus, Plus, Clock, FileText, Target
} from 'lucide-react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';

// Fonction sommaire inchangée
const extractHeadings = (markdown: string) => {
    const lines = markdown.split('\n');
    const headings = [];
    let idCounter = 0;
    for (const line of lines) {
        if (line.startsWith('# ')) headings.push({ id: `s-${idCounter++}`, text: line.replace('# ', ''), level: 1 });
        else if (line.startsWith('## ')) headings.push({ id: `s-${idCounter++}`, text: line.replace('## ', ''), level: 2 });
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
            if (data.extracted_text) setHeadings(extractHeadings(data.extracted_text));
        }).catch(() => router.push('/workspace/courses'));
    }
  }, [user, id]);

  const handleScroll = () => {
      if (contentRef.current) {
          const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
          setScrollProgress((scrollTop / (scrollHeight - clientHeight)) * 100);
      }
  };

  const scrollToSection = (id: string) => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (!course) return <div className="flex h-screen items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-slate-900" /></div>;

  const readTime = Math.ceil(course.extracted_text.split(/\s+/).length / 200);

  const ActionCard = ({ icon: Icon, title, desc, color, href }: any) => (
     <Link href={href} className={`group bg-white border border-slate-200 rounded-[2rem] p-6 hover:border-${color}-400 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-64 relative overflow-hidden`}>
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
        <button onClick={() => router.push('/workspace/courses')} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold text-sm mb-8 transition-colors">
            <ArrowLeft size={18} /> Retour
        </button>

        <div className="relative bg-slate-900 rounded-[2.5rem] p-8 md:p-12 mb-12 overflow-hidden shadow-2xl shadow-slate-200">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600 rounded-full blur-[100px] opacity-20 -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-600 rounded-full blur-[80px] opacity-20 -ml-20 -mb-20"></div>
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 rounded-full border border-white/20 text-white/90 text-xs font-black uppercase tracking-widest bg-white/5 backdrop-blur-md">{course.subject || 'Général'}</span>
                    <span className="text-white/50 text-xs font-bold flex items-center gap-1"><Calendar size={12}/> {new Date(course.created_at).toLocaleDateString()}</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight tracking-tight">{course.title}</h1>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <Link href={`/workspace/courses/${id}/mastery`} className="col-span-1 md:col-span-2 bg-white border border-slate-200 rounded-[2rem] p-8 hover:border-blue-500 hover:shadow-xl transition-all group flex flex-col justify-between min-h-[300px] relative overflow-hidden">
                <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-200"><Play size={24} fill="currentColor" /></div>
                        <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">Recommandé</span>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mb-2">Parcours 20/20</h3>
                    <p className="text-slate-500 font-medium max-w-md text-lg">Le chemin guidé vers l'excellence.</p>
                </div>
                <div className="relative z-10 flex items-center gap-2 text-blue-600 font-bold mt-8 group-hover:translate-x-2 transition-transform">
                    Lancer la session <ArrowRight size={20} strokeWidth={3} />
                </div>
            </Link>

            <div onClick={() => setShowReader(true)} className="bg-white border border-slate-200 rounded-[2rem] p-8 hover:border-slate-400 hover:shadow-xl transition-all group cursor-pointer flex flex-col justify-between h-full min-h-[300px]">
                <div>
                    <div className="w-12 h-12 bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center mb-4 group-hover:bg-slate-900 group-hover:text-white transition-colors"><AlignLeft size={24} /></div>
                    <h3 className="text-xl font-black text-slate-900 mb-2">Lecteur Zen</h3>
                    <p className="text-sm text-slate-500 font-medium">Lecture optimisée. {readTime} min.</p>
                </div>
                <button className="w-full py-3 bg-slate-50 text-slate-600 rounded-xl font-bold text-sm group-hover:bg-slate-900 group-hover:text-white transition-colors">Lire le cours</button>
            </div>

            <ActionCard title="Fiche Synthèse" desc="L'essentiel en une page." icon={FileText} color="blue" href={`/workspace/courses/${id}/summary`} />
            <ActionCard title="S'exercer" desc="Entraînement infini corrigé." icon={Target} color="green" href={`/workspace/courses/${id}/practice`} />
            <ActionCard title="Flashcards" desc="Mémorisation active." icon={Zap} color="amber" href={`/workspace/courses/${id}/generate-flashcards`} />
            <ActionCard title="Quiz Express" desc="Testez vos connaissances." icon={Brain} color="purple" href={`/workspace/courses/${id}/generate-quiz`} />
        </div>

        {/* LECTEUR ZEN */}
        {showReader && (
            <div className="fixed inset-0 bg-white z-[100] flex flex-col animate-in slide-in-from-bottom duration-300">
                <div className="h-1 bg-slate-100 w-full"><div className="h-full bg-blue-600 transition-all duration-100 ease-out" style={{ width: `${scrollProgress}%` }}></div></div>
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white/95 backdrop-blur sticky top-0 z-20 shadow-sm">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setShowReader(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors group"><X size={24} className="text-slate-400 group-hover:text-slate-900"/></button>
                        <button onClick={() => setShowToc(!showToc)} className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold bg-slate-100 hover:bg-slate-200 transition-all"><List size={16}/> Sommaire</button>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl">
                        <button onClick={() => setFontSize(s => Math.max(14, s - 2))} className="p-2 hover:bg-white rounded-lg"><Minus size={16} /></button>
                        <span className="text-xs font-bold px-2">{fontSize}px</span>
                        <button onClick={() => setFontSize(s => Math.min(24, s + 2))} className="p-2 hover:bg-white rounded-lg"><Plus size={16} /></button>
                    </div>
                </div>
                <div className="flex flex-1 overflow-hidden">
                    <div className={`w-72 border-r border-slate-100 bg-slate-50 overflow-y-auto p-6 hidden md:block transition-all ${showToc ? '' : '-ml-72'}`}>
                        <h3 className="font-bold text-sm uppercase mb-4 text-slate-400">Plan</h3>
                        {headings.map((h, i) => <button key={i} onClick={() => scrollToSection(h.id)} className="block w-full text-left text-sm py-2 px-3 hover:bg-white rounded-lg mb-1 font-medium text-slate-600">{h.text}</button>)}
                    </div>
                    <div ref={contentRef} onScroll={handleScroll} className="flex-1 overflow-y-auto bg-white scroll-smooth">
                        <div className="max-w-3xl mx-auto py-20 px-8 min-h-full">
                            <h1 className="text-4xl font-serif font-black mb-12 text-center">{course.title}</h1>
                            <div style={{ fontSize: `${fontSize}px` }} className="text-slate-800 font-serif leading-loose prose max-w-none">
                                <ReactMarkdown
                                    components={{
                                        h1: ({node, ...props}) => <h1 id={headings.find(h => h.text === props.children)?.id} className="text-3xl font-sans font-black mt-16 mb-6" {...props} />,
                                        h2: ({node, ...props}) => <h2 id={headings.find(h => h.text === props.children)?.id} className="text-2xl font-sans font-bold mt-12 mb-4 border-l-4 border-blue-500 pl-4" {...props} />,
                                    }}
                                >
                                    {course.extracted_text}
                                </ReactMarkdown>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
}