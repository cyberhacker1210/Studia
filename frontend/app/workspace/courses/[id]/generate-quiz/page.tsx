'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { getCourseById, Course } from '@/lib/courseService';
import { generateQuizFromText, Quiz } from '@/lib/api';
import {
  ArrowLeft, Loader2, Brain, Zap, Settings, FileText,
  Save, CheckCircle, BarChart3, Clock, Sparkles, X
} from 'lucide-react';
import QuizDisplay from '@/components/workspace/QuizDisplay';
import QuizResults from '@/components/workspace/QuizResults';
import { useEnergy } from '@/hooks/useEnergy';
import { PWAService } from '@/lib/pwaService';

type Step = 'config' | 'generating' | 'taking' | 'results';

export default function GenerateQuizPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { consumeEnergy, isPremium } = useEnergy();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<Step>('config');
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  useEffect(() => {
    if (isLoaded && user && params.id) loadCourse();
  }, [isLoaded, user, params.id]);

  const loadCourse = async () => {
    if (!user) return;
    try {
      const data = await getCourseById(Number(params.id), user.id);
      if (!data) router.push('/workspace/courses');
      else setCourse(data);
    } catch (err) {
      router.push('/workspace/courses');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!course) return;

    const canProceed = await consumeEnergy(1);
    if (!canProceed) {
        router.push('/workspace/pricing');
        return;
    }

    try {
      setStep('generating');
      setError(null);
      const generatedQuiz = await generateQuizFromText(course.extracted_text, numQuestions, difficulty);

      const offlineQuiz = { ...generatedQuiz, id: `quiz-${Date.now()}`, courseId: course.id, title: `Quiz ${difficulty} - ${course.title}` };
      await PWAService.saveQuizOffline(offlineQuiz);

      setQuiz(offlineQuiz);
      setStep('taking');
    } catch (err: any) {
      setError(err.message);
      setStep('config');
    }
  };

  const handleQuizCompleted = (answers: number[]) => {
    setUserAnswers(answers);
    setStep('results');
  };

  const handleRetake = () => { setUserAnswers([]); setStep('taking'); };
  const handleNewQuiz = () => { setQuiz(null); setUserAnswers([]); setStep('config'); };
  const handleSaveForLater = () => router.push('/workspace/quiz');

  if (!isLoaded || loading) {
    return <div className="h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-blue-600 h-12 w-12" /></div>;
  }
  if (!course) return null;

  return (
    <div className="max-w-3xl mx-auto pb-20 pt-8 px-6 min-h-screen">

      {/* Header Nav */}
      {step !== 'taking' && step !== 'results' && (
        <button onClick={() => router.push(`/workspace/courses/${params.id}`)} className="group flex items-center gap-3 text-slate-500 hover:text-slate-900 mb-8 font-bold text-sm transition-colors">
          <div className="w-10 h-10 rounded-full border-2 border-slate-200 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all bg-slate-50">
             <ArrowLeft size={18} />
          </div>
          Retour au cours
        </button>
      )}

      {/* STEP 1: CONFIGURATION */}
      {step === 'config' && (
        <div className="animate-in fade-in slide-in-from-bottom-4">

          <div className="text-center mb-12">
             <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-4 border border-blue-200 shadow-sm">
                <Brain size={14} /> Studia AI
             </div>
             <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-3 tracking-tight">Générateur de Quiz</h1>
             <p className="text-slate-500 font-medium text-lg max-w-lg mx-auto">
                Personnalisez votre entraînement sur <span className="text-slate-900 font-bold">"{course.title}"</span>.
             </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-slate-200/50 relative overflow-hidden">

            {/* Décoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-60"></div>

            <div className="relative z-10 space-y-10">

                {/* Sélecteur Difficulté */}
                <div>
                    <label className="flex items-center gap-2 text-lg font-black text-slate-900 mb-4">
                        <BarChart3 className="text-blue-600"/> Niveau de Difficulté
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                            { id: 'easy', label: 'Basique', desc: 'Concepts clés', color: 'bg-green-50 border-green-200 text-green-700' },
                            { id: 'medium', label: 'Standard', desc: 'Application', color: 'bg-blue-50 border-blue-200 text-blue-700' },
                            { id: 'hard', label: 'Expert', desc: 'Pièges & Détails', color: 'bg-red-50 border-red-200 text-red-700' }
                        ].map((level) => (
                            <button
                                key={level.id}
                                onClick={() => setDifficulty(level.id as any)}
                                className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 active:scale-95 flex flex-col gap-1 ${
                                    difficulty === level.id 
                                    ? `${level.color} shadow-md scale-105 ring-2 ring-offset-2 ring-transparent` 
                                    : 'bg-white border-slate-100 hover:border-slate-300 text-slate-400 hover:text-slate-600'
                                }`}
                            >
                                <span className="font-black text-lg">{level.label}</span>
                                <span className="text-xs font-bold opacity-80">{level.desc}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Slider Questions */}
                <div>
                    <div className="flex justify-between items-end mb-4">
                        <label className="flex items-center gap-2 text-lg font-black text-slate-900">
                            <FileText className="text-purple-600"/> Longueur du Quiz
                        </label>
                        <span className="text-4xl font-black text-slate-900 bg-slate-100 px-4 py-1 rounded-xl">
                            {numQuestions}
                        </span>
                    </div>

                    <div className="relative h-12 flex items-center">
                        <div className="absolute w-full h-4 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                                style={{ width: `${((numQuestions - 3) / 12) * 100}%` }}
                            ></div>
                        </div>
                        <input
                            type="range"
                            min="3"
                            max="15"
                            step="1"
                            value={numQuestions}
                            onChange={(e) => setNumQuestions(Number(e.target.value))}
                            className="absolute w-full h-full opacity-0 cursor-pointer"
                        />
                        <div
                            className="absolute h-8 w-8 bg-white border-4 border-slate-900 rounded-full shadow-lg pointer-events-none transition-all"
                            style={{ left: `calc(${((numQuestions - 3) / 12) * 100}% - 16px)` }}
                        ></div>
                    </div>

                    <div className="flex justify-between text-xs font-bold text-slate-400 mt-2 uppercase tracking-wider px-1">
                        <span>Rapide (3)</span>
                        <span>Complet (15)</span>
                    </div>
                </div>

                {/* Résumé & Action */}
                <div className="pt-6 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-lg shadow-sm text-yellow-500"><Zap size={20} fill="currentColor"/></div>
                            <span className="text-sm font-bold text-slate-600">Coût de génération</span>
                        </div>
                        <span className={`text-sm font-black ${isPremium ? 'text-green-600' : 'text-slate-900'}`}>
                            {isPremium ? "Gratuit (Premium)" : "-1 Éclair"}
                        </span>
                    </div>

                    <button
                        onClick={handleGenerate}
                        className="w-full btn-b-primary py-5 text-xl shadow-xl shadow-blue-200 hover:shadow-blue-300 hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center gap-3"
                    >
                        <Sparkles size={24} className="animate-pulse"/> Lancer la création
                    </button>
                </div>

            </div>
            {error && <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-xl text-center font-bold animate-shake border-2 border-red-100">{error}</div>}
          </div>
        </div>
      )}

      {/* STEP 2: GENERATING (Animation Cool) */}
      {step === 'generating' && (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-in fade-in">
          <div className="relative mb-10">
             <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center animate-pulse">
                 <Brain size={64} className="text-blue-600"/>
             </div>
             {/* Particules orbitales */}
             <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-500/20 rounded-full animate-spin-slow border-t-blue-500"></div>
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-3">Construction du Quiz...</h2>
          <p className="text-slate-500 font-medium text-lg max-w-md mx-auto animate-pulse">
             L'IA analyse vos notes pour piéger vos faiblesses.
          </p>
        </div>
      )}

      {/* STEP 3: TAKING */}
      {step === 'taking' && quiz && (
        <div className="animate-in slide-in-from-right-8">
           <div className="flex justify-between items-center mb-8">
               <button onClick={() => { if(confirm("Annuler ?")) router.push(`/workspace/courses/${params.id}`); }} className="text-xs font-bold text-slate-400 hover:text-red-500 uppercase tracking-widest transition-colors flex items-center gap-2">
                 <X size={16}/> Annuler
               </button>

               <button onClick={handleSaveForLater} className="flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 px-4 py-2.5 rounded-xl hover:bg-blue-100 transition-colors border border-blue-100">
                  <Save size={16} /> Sauvegarder
               </button>
           </div>
          <QuizDisplay quiz={quiz} onComplete={handleQuizCompleted} />
        </div>
      )}

      {/* STEP 4: RESULTS */}
      {step === 'results' && quiz && (
        <QuizResults quiz={quiz} userAnswers={userAnswers} onRetake={handleRetake} onNewQuiz={handleNewQuiz} />
      )}
    </div>
  );
}