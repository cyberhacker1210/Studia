'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Loader2, ArrowLeft, CheckCircle, BookOpen, Layers, Brain, Lightbulb, ListTree } from 'lucide-react';
import { getCourseById } from '@/lib/courseService';
import { addXp } from '@/lib/gamificationService';
import QuizDisplay from '@/components/workspace/QuizDisplay';
import FlashcardViewer from '@/components/workspace/FlashcardViewer';
import StructurePuzzle from '@/components/workspace/StructurePuzzle'; // ✅ IMPORT
import ReactMarkdown from 'react-markdown';
import confetti from 'canvas-confetti';

export default function MasteryPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();

  const [loading, setLoading] = useState(true);
  const [steps, setSteps] = useState<any[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [courseTitle, setCourseTitle] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    if (user && params.id) initMastery();
  }, [user, params.id]);

  const initMastery = async () => {
    try {
      const course = await getCourseById(Number(params.id), user!.id);
      setCourseTitle(course.title);

      const res = await fetch(`${API_URL}/api/path/generate`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ course_text: course.extracted_text, subject: course.subject })
      });

      const data = await res.json();
      setSteps(data.steps || []);
      setLoading(false);

    } catch (e) {
        console.error(e);
        alert("Erreur de chargement.");
        router.push('/workspace/courses');
    }
  };

  const handleNext = () => {
      if (currentStepIndex < steps.length - 1) {
          setCurrentStepIndex(i => i + 1);
          window.scrollTo(0, 0);
      } else {
          finishPath();
      }
  };

  const finishPath = () => {
      if (user) addXp(user.id, 300, "Parcours 20/20 Terminé");
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
      setTimeout(() => router.push('/workspace/courses'), 3000);
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600 h-12 w-12"/></div>;

  const currentStep = steps[currentStepIndex];
  const progress = Math.round(((currentStepIndex) / steps.length) * 100);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">

        {/* HEADER */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-20 shadow-sm">
            <div className="max-w-3xl mx-auto">
                <div className="flex justify-between items-center mb-2">
                    <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold text-sm">
                        <ArrowLeft size={16}/> Quitter
                    </button>
                    <span className="text-xs font-black uppercase tracking-widest text-blue-600">
                        {currentStep.title}
                    </span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 transition-all duration-500 ease-out" style={{width: `${progress}%`}}></div>
                </div>
            </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-8">

            {/* VUE : STRUCTURE (NOUVEAU) */}
            {currentStep.type === 'structure' && (
                <div className="animate-in fade-in slide-in-from-right-8">
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <ListTree size={32}/>
                        </div>
                        <h2 className="text-3xl font-black text-slate-900">Squelette du Cours</h2>
                        <p className="text-slate-500 font-medium">Reconstruisez le plan pour comprendre la logique.</p>
                    </div>

                    <StructurePuzzle
                        items={currentStep.data.items}
                        onComplete={handleNext}
                    />
                </div>
            )}

            {/* VUE : COURS */}
            {currentStep.type === 'learn' && (
                <div className="animate-in fade-in slide-in-from-right-8">
                    <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-200 shadow-sm mb-8">
                        <div className="flex items-center gap-4 mb-6 border-b border-slate-100 pb-6">
                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center"><BookOpen size={24}/></div>
                            <h2 className="text-2xl font-black text-slate-900">Comprendre</h2>
                        </div>
                        <article className="prose prose-slate max-w-none prose-headings:font-bold prose-p:text-slate-600">
                            <ReactMarkdown>{currentStep.data.content_markdown}</ReactMarkdown>
                        </article>
                    </div>
                    <button onClick={handleNext} className="btn-b-primary w-full py-4 text-lg">C'est compris, suite</button>
                </div>
            )}

            {/* VUE : FLASHCARDS */}
            {currentStep.type === 'flashcards' && (
                <div className="animate-in fade-in slide-in-from-right-8">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4"><Layers size={32}/></div>
                        <h2 className="text-3xl font-black text-slate-900">Ancrage Mémoriel</h2>
                        <p className="text-slate-500">Mémorisez ces éléments par cœur.</p>
                    </div>
                    <FlashcardViewer flashcards={currentStep.data.flashcards} />
                    <div className="text-center mt-12">
                        <button onClick={handleNext} className="btn-b-primary px-12 py-3">J'ai tout retenu</button>
                    </div>
                </div>
            )}

            {/* VUE : QUIZ */}
            {currentStep.type === 'quiz' && (
                <div className="animate-in fade-in slide-in-from-right-8">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4"><Brain size={32}/></div>
                        <h2 className="text-3xl font-black text-slate-900">Validation</h2>
                    </div>
                    <QuizDisplay quiz={{questions: currentStep.data.questions}} onComplete={handleNext} />
                </div>
            )}

            {/* VUE : METHODOLOGIE */}
            {currentStep.type === 'method' && (
                <div className="animate-in fade-in slide-in-from-right-8">
                    <div className="bg-yellow-50 border-2 border-yellow-100 p-8 rounded-[2.5rem] mb-8">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-yellow-200 text-yellow-800 rounded-xl flex items-center justify-center"><Lightbulb size={24}/></div>
                            <h2 className="text-2xl font-black text-yellow-900">Méthodologie 20/20</h2>
                        </div>
                        <article className="prose prose-yellow max-w-none">
                            <ReactMarkdown>{currentStep.data.tips_markdown}</ReactMarkdown>
                        </article>
                    </div>
                    <button onClick={handleNext} className="btn-b-primary w-full py-4 text-lg">J'applique</button>
                </div>
            )}

        </div>
    </div>
  );
}