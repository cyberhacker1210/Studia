'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { getCourseById, Course } from '@/lib/courseService';
import { generateQuizFromText, Quiz } from '@/lib/api';
import { ArrowLeft, Loader2, Brain, Zap, Settings, FileText } from 'lucide-react';
import QuizDisplay from '@/components/workspace/QuizDisplay';
import QuizResults from '@/components/workspace/QuizResults';

type Step = 'config' | 'generating' | 'taking' | 'results';

export default function GenerateQuizPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<Step>('config');
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Config
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  useEffect(() => {
    if (isLoaded && user && params.id) {
      loadCourse();
    }
  }, [isLoaded, user, params.id]);

  const loadCourse = async () => {
    if (!user) return;
    try {
      const data = await getCourseById(Number(params.id), user.id);
      if (!data) {
        router.push('/workspace/courses');
        return;
      }
      setCourse(data);
    } catch (err) {
      console.error('Erreur:', err);
      router.push('/workspace/courses');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!course) return;
    try {
      setStep('generating');
      setError(null);
      const generatedQuiz = await generateQuizFromText(
        course.extracted_text,
        numQuestions,
        difficulty
      );
      setQuiz(generatedQuiz);
      setStep('taking');
    } catch (err: any) {
      console.error('❌ Erreur:', err);
      setError(err.message);
      setStep('config');
    }
  };

  const handleQuizCompleted = (answers: number[]) => {
    setUserAnswers(answers);
    setStep('results');
  };

  const handleRetake = () => {
    setUserAnswers([]);
    setStep('taking');
  };

  const handleNewQuiz = () => {
    setQuiz(null);
    setUserAnswers([]);
    setStep('config');
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4 animate-pulse">
           <Loader2 className="animate-spin h-10 w-10 text-slate-900" />
           <span className="text-slate-400 font-bold text-sm uppercase tracking-widest">Chargement...</span>
        </div>
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="max-w-3xl mx-auto pb-20 pt-6 px-4">

      {/* Header Navigation */}
      {step !== 'taking' && step !== 'results' && (
        <button
          onClick={() => router.push(`/workspace/courses/${params.id}`)}
          className="group flex items-center gap-3 text-slate-500 hover:text-slate-900 mb-10 font-bold text-sm transition-colors"
        >
          <div className="w-10 h-10 rounded-full border-2 border-slate-100 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
             <ArrowLeft size={18} />
          </div>
          Retour au cours
        </button>
      )}

      {/* STEP 1: CONFIGURATION */}
      {step === 'config' && (
        <div className="animate-in fade-in slide-in-from-bottom-4">
          <div className="text-center mb-10">
             <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-4">
                <Settings size={12} /> Configuration
             </div>
             <h1 className="text-4xl font-black text-slate-900 mb-2">Générer un Quiz</h1>
             <p className="text-slate-500 font-medium text-lg">Depuis : {course.title}</p>
          </div>

          <div className="card-b">
            {/* Range Slider */}
            <div className="mb-10">
              <div className="flex justify-between items-end mb-4">
                <label className="text-lg font-bold text-slate-900 flex items-center gap-2">
                   <FileText size={20} className="text-slate-400" /> Nombre de questions
                </label>
                <span className="text-3xl font-black text-blue-600">{numQuestions}</span>
              </div>
              <input
                type="range"
                min="3"
                max="15"
                value={numQuestions}
                onChange={(e) => setNumQuestions(Number(e.target.value))}
                className="w-full h-4 bg-slate-100 rounded-full appearance-none cursor-pointer accent-slate-900 hover:accent-blue-600 transition-colors"
              />
              <div className="flex justify-between text-xs font-bold text-slate-400 mt-2 uppercase tracking-wider">
                <span>Rapide (3)</span>
                <span>Complet (15)</span>
              </div>
            </div>

            {/* Difficulty Selector */}
            <div className="mb-10">
              <label className="block text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                 <Brain size={20} className="text-slate-400"/> Difficulté
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['easy', 'medium', 'hard'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setDifficulty(level)}
                    className={`py-4 rounded-2xl font-bold text-sm transition-all duration-200 border-2 ${
                      difficulty === level
                        ? 'bg-slate-900 text-white border-slate-900 shadow-lg transform scale-105'
                        : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {level === 'easy' && '🌱 Facile'}
                    {level === 'medium' && '⚡ Moyen'}
                    {level === 'hard' && '🔥 Difficile'}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={handleGenerate}
              className="w-full btn-b-primary py-4 text-lg"
            >
              <Zap size={20} fill="currentColor" /> Générer le Quiz
            </button>

            {/* Error Message */}
            {error && (
              <div className="mt-6 p-4 bg-red-50 border-2 border-red-100 rounded-2xl text-red-600 text-sm font-bold text-center animate-in zoom-in">
                ⚠️ {error}
              </div>
            )}
          </div>

          <p className="text-center text-xs font-bold text-slate-300 uppercase tracking-widest mt-8">
             Propulsé par l'IA Studia
          </p>
        </div>
      )}

      {/* STEP 2: GENERATING */}
      {step === 'generating' && (
        <div className="text-center py-20 animate-in fade-in">
          <div className="relative w-24 h-24 mx-auto mb-8">
             <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
             <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
             <Brain className="absolute inset-0 m-auto text-slate-900" size={32}/>
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-3">Analyse du cours...</h2>
          <p className="text-slate-500 font-medium text-lg max-w-md mx-auto">
             L'IA identifie les concepts clés et prépare {numQuestions} questions.
          </p>
        </div>
      )}

      {/* STEP 3: TAKING */}
      {step === 'taking' && quiz && (
        <div className="animate-in slide-in-from-right-8">
           <button
            onClick={() => {
                if(confirm("Quitter le quiz ? Votre progression sera perdue.")) {
                    router.push(`/workspace/courses/${params.id}`);
                }
            }}
            className="mb-6 text-xs font-bold text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors"
          >
            ✕ Annuler
          </button>
          <QuizDisplay quiz={quiz} onComplete={handleQuizCompleted} />
        </div>
      )}

      {/* STEP 4: RESULTS */}
      {step === 'results' && quiz && (
        <QuizResults
          quiz={quiz}
          userAnswers={userAnswers}
          onRetake={handleRetake}
          onNewQuiz={handleNewQuiz}
        />
      )}
    </div>
  );
}