'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { getCourseById, Course } from '@/lib/courseService';
import {
    ArrowLeft, Calendar, FileQuestion, Layers, BrainCircuit,
    Clock, Pencil, Check, X
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { supabase } from '@/lib/supabase';

export default function CourseReaderPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  // État pour l'édition du titre
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    if (user && params.id) loadCourse();
  }, [user, params.id]);

  const loadCourse = async () => {
    try {
      const data = await getCourseById(Number(params.id), user!.id);
      setCourse(data);
      setNewTitle(data?.title || '');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateExamDate = async (dateStr: string) => {
      if(!course) return;
      try {
          await supabase.from('courses').update({ exam_date: dateStr }).eq('id', course.id);
          setCourse({...course, exam_date: dateStr});
      } catch(e) { alert("Erreur sauvegarde date"); }
  };

  const saveTitle = async () => {
      if(!course || !newTitle.trim()) return;
      try {
          await supabase.from('courses').update({ title: newTitle }).eq('id', course.id);
          setCourse({...course, title: newTitle});
          setIsEditingTitle(false);
      } catch(e) { alert("Erreur sauvegarde titre"); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-indigo-600 rounded-full animate-spin border-t-transparent"></div>
    </div>
  );

  if (!course) return <div className="p-10 text-center">Cours introuvable.</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] overflow-x-hidden font-sans text-slate-900">

      {/* --- HEADER --- */}
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 h-16 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3 overflow-hidden w-full max-w-2xl">
            <button
                onClick={() => router.back()}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-500 shrink-0 transition-colors"
            >
                <ArrowLeft size={24} />
            </button>

            {/* GESTION DU TITRE DANS LA NAVBAR */}
            {isEditingTitle ? (
                <div className="flex items-center gap-2 w-full">
                    <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="font-bold text-slate-900 text-lg bg-slate-50 px-3 py-1 rounded-lg border border-indigo-300 focus:ring-2 focus:ring-indigo-500 outline-none w-full"
                        autoFocus
                    />
                    <button onClick={saveTitle} className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"><Check size={18}/></button>
                    <button onClick={() => setIsEditingTitle(false)} className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"><X size={18}/></button>
                </div>
            ) : (
                <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setIsEditingTitle(true)}>
                    <h1 className="font-bold text-slate-900 truncate text-lg group-hover:text-indigo-700 transition-colors">
                        {course.title}
                    </h1>
                    <Pencil size={14} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"/>
                </div>
            )}
        </div>

        <div className="hidden md:flex items-center gap-2 shrink-0 ml-4">
            <div className="text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 uppercase tracking-wide">
                <Clock size={12} className="mr-1.5 inline"/>
                {new Date(course.created_at).toLocaleDateString()}
            </div>
        </div>
      </nav>

      {/* --- BARRE OUTILS --- */}
      <div className="max-w-3xl mx-auto px-4 mt-8">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-10">

            <button
                onClick={() => router.push(`/workspace/courses/${course.id}/mastery`)}
                className="flex-1 sm:flex-none justify-center flex items-center gap-2 bg-slate-900 text-white px-6 py-3.5 rounded-xl font-bold text-base hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200 hover:shadow-indigo-200 transform hover:-translate-y-0.5"
            >
                <BrainCircuit size={20}/>
                Lancer le Parcours
            </button>

            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
                <button
                    onClick={() => router.push(`/workspace/courses/${course.id}/generate-quiz`)}
                    className="flex items-center gap-2 bg-white text-slate-700 border border-slate-200 px-5 py-3 rounded-xl font-bold text-sm hover:bg-slate-50 hover:border-slate-300 whitespace-nowrap transition-colors"
                >
                    <FileQuestion size={18} className="text-blue-600"/> Quiz
                </button>
                <button
                    onClick={() => router.push(`/workspace/courses/${course.id}/generate-flashcards`)}
                    className="flex items-center gap-2 bg-white text-slate-700 border border-slate-200 px-5 py-3 rounded-xl font-bold text-sm hover:bg-slate-50 hover:border-slate-300 whitespace-nowrap transition-colors"
                >
                    <Layers size={18} className="text-purple-600"/> Flashcards
                </button>
            </div>

            <div className="ml-auto sm:w-auto w-full">
                <div className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-xl hover:border-indigo-300 transition-colors w-full sm:w-auto shadow-sm">
                    <Calendar size={18} className="text-slate-400 shrink-0"/>
                    <input
                        type="date"
                        className="text-sm font-bold text-slate-600 bg-transparent outline-none uppercase tracking-wide w-full cursor-pointer"
                        value={course.exam_date ? new Date(course.exam_date).toISOString().split('T')[0] : ''}
                        onChange={(e) => updateExamDate(e.target.value)}
                    />
                </div>
            </div>
        </div>
      </div>

      {/* --- CONTENU DU COURS --- */}
      <main className="max-w-3xl mx-auto px-4 pb-32 w-full">

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 md:p-16 w-full overflow-hidden">

            {/* Titre modifiable dans le document aussi */}
            <div className="group mb-10 pb-8 border-b border-slate-100 flex items-start justify-between gap-4">
                {isEditingTitle ? (
                    <div className="flex items-center gap-2 w-full">
                        <input
                            type="text"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            className="text-3xl font-black text-slate-900 bg-slate-50 px-4 py-2 rounded-xl border border-indigo-300 focus:ring-4 focus:ring-indigo-100 outline-none w-full"
                            autoFocus
                        />
                        <button onClick={saveTitle} className="p-3 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 shadow-sm"><Check size={24}/></button>
                    </div>
                ) : (
                    <div className="w-full cursor-pointer" onClick={() => setIsEditingTitle(true)}>
                        <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight break-words group-hover:text-indigo-700 transition-colors">
                            {course.title}
                        </h1>
                        <p className="text-sm text-indigo-500 font-bold mt-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                            <Pencil size={12}/> Modifier le titre
                        </p>
                    </div>
                )}
            </div>

            {/* CONTENU MARKDOWN (Inchangé, toujours propre) */}
            <article className="prose prose-xl max-w-none w-full text-slate-800 leading-loose">
                <ReactMarkdown
                    components={{
                        p: ({node, ...props}) => <p className="text-slate-800 mb-6 break-words w-full font-normal" style={{ fontSize: '1.125rem', lineHeight: '1.8' }} {...props} />,
                        h1: ({node, ...props}) => <h2 className="text-3xl font-black text-slate-900 mt-12 mb-6 break-words" {...props} />,
                        h2: ({node, ...props}) => <h3 className="text-2xl font-bold text-slate-900 mt-10 mb-4 break-words" {...props} />,
                        h3: ({node, ...props}) => <h4 className="text-xl font-bold text-slate-800 mt-8 mb-3 break-words" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc list-outside ml-6 space-y-3 text-slate-800 mb-6" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal list-outside ml-6 space-y-3 text-slate-800 mb-6" {...props} />,
                        li: ({node, ...props}) => <li className="break-words pl-2" {...props} />,
                        a: ({node, ...props}) => <a className="text-indigo-600 font-semibold hover:underline decoration-2 underline-offset-2" {...props} />,
                        blockquote: ({node, ...props}) => (
                            <blockquote className="border-l-4 border-indigo-500 bg-indigo-50 p-6 rounded-r-xl italic text-indigo-900 my-8 font-medium text-lg" {...props} />
                        ),
                        strong: ({node, ...props}) => <strong className="font-black text-slate-900" {...props} />,
                        pre: ({node, ...props}) => (
                            <div className="overflow-x-auto w-full bg-gray-50 border border-gray-200 p-6 rounded-2xl my-6">
                                <pre className="whitespace-pre-wrap break-all text-sm font-mono text-slate-800" {...props} />
                            </div>
                        ),
                        code: ({node, ...props}) => (
                            <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-slate-800 break-all border border-gray-200" {...props} />
                        ),
                    }}
                >
                    {course.extracted_text}
                </ReactMarkdown>
            </article>

        </div>
      </main>

    </div>
  );
}