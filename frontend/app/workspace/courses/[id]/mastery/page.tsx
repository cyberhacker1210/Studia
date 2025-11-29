'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { ArrowLeft, Lock, Check, Play, Star, Brain, Loader2 } from 'lucide-react';
import { getCourseById } from '@/lib/courseService';
import { addXp } from '@/lib/gamificationService';
import { supabase } from '@/lib/supabase';
import ReactMarkdown from 'react-markdown';

// Types
interface Module {
  title: string;
  description: string;
  content: string;
  quiz: {
    question: string;
    options: string[];
    correct_index: number;
    explanation: string;
  }[];
}

export default function MasteryPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();

  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState<Module[]>([]);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [view, setView] = useState<'map' | 'learning' | 'quiz' | 'success'>('map');

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizError, setQuizError] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    if (user && params.id) loadPath();
  }, [user, params.id]);

  const loadPath = async () => {
    try {
      // 1. Vérifier si on a déjà une progression sauvegardée localement (ou DB)
      // Pour ce MVP amélioré, on utilise localStorage pour la structure des modules
      const localData = localStorage.getItem(`mastery_data_${params.id}`);

      // 2. Récupérer la progression utilisateur depuis Supabase
      const { data: progress } = await supabase
        .from('course_progress')
        .select('current_module_index')
        .eq('user_id', user!.id)
        .eq('course_id', params.id)
        .single();

      if (progress) {
        setCurrentModuleIndex(progress.current_module_index || 0);
      }

      if (localData) {
        setModules(JSON.parse(localData));
        setLoading(false);
      } else {
        // Sinon, on génère via l'IA
        generateModules();
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const generateModules = async () => {
    setLoading(true);
    try {
      const course = await getCourseById(Number(params.id), user!.id);
      const res = await fetch(`${API_URL}/api/path/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course_text: course.extracted_text }),
      });

      const data = await res.json();
      if (data.modules) {
        setModules(data.modules);
        localStorage.setItem(`mastery_data_${params.id}`, JSON.stringify(data.modules));

        // Init progress in DB
        await supabase.from('course_progress').upsert({
            user_id: user!.id,
            course_id: Number(params.id),
            current_module_index: 0
        }, { onConflict: 'user_id,course_id' });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const startModule = (index: number) => {
    if (index > currentModuleIndex) return; // Locked
    setCurrentModuleIndex(index); // Juste pour l'affichage
    setView('learning');
  };

  const handleFinishLearning = () => {
    setQuizAnswers(new Array(modules[currentModuleIndex].quiz.length).fill(-1));
    setView('quiz');
  };

  const submitQuiz = async () => {
    const currentQuiz = modules[currentModuleIndex].quiz;
    const isAllCorrect = currentQuiz.every((q, i) => quizAnswers[i] === q.correct_index);

    if (isAllCorrect) {
      setView('success');
      const nextIndex = currentModuleIndex + 1;

      // Sauvegarder la progression
      if (nextIndex > currentModuleIndex) {
          await supabase.from('course_progress').upsert({
            user_id: user!.id,
            course_id: Number(params.id),
            current_module_index: nextIndex
          }, { onConflict: 'user_id,course_id' });

          // Mettre à jour l'état local pour débloquer le suivant
          setCurrentModuleIndex(nextIndex);
      }

      addXp(user!.id, 100, `Module ${currentModuleIndex + 1} terminé`);
    } else {
      setQuizError("Certaines réponses sont incorrectes. Réessayez !");
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white flex-col gap-4">
        <div className="relative w-24 h-24">
            <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            <Brain className="absolute inset-0 m-auto text-slate-900" size={32}/>
        </div>
        <p className="font-bold text-slate-900">Création de votre parcours sur mesure...</p>
        <p className="text-sm text-slate-500">L'IA découpe votre cours en sessions digestes.</p>
      </div>
    );
  }

  // === VUE 1 : LA CARTE (MAP) ===
  if (view === 'map') {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 pb-24">
        <button onClick={() => router.push(`/workspace/courses/${params.id}`)} className="flex items-center gap-2 text-slate-500 font-bold text-sm mb-10 hover:text-slate-900 transition-colors">
            <ArrowLeft size={18}/> Retour
        </button>

        <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-yellow-50 text-yellow-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-4 border border-yellow-100">
                <Star size={12} fill="currentColor"/> Parcours Maîtrise
            </div>
            <h1 className="text-4xl font-black text-slate-900 mb-2">Votre chemin vers la réussite</h1>
            <p className="text-slate-500 font-medium">3 étapes pour maîtriser ce cours sans effort.</p>
        </div>

        <div className="space-y-6 relative">
            {/* Ligne verticale de connexion */}
            <div className="absolute left-8 top-8 bottom-8 w-1 bg-slate-100 -z-10"></div>

            {modules.map((mod, idx) => {
                const isLocked = idx > currentModuleIndex;
                const isCompleted = idx < currentModuleIndex;
                const isCurrent = idx === currentModuleIndex;

                return (
                    <div
                        key={idx}
                        onClick={() => !isLocked && startModule(idx)}
                        className={`relative flex items-center gap-6 p-6 rounded-[2rem] border-2 transition-all duration-300 group ${
                            isLocked 
                            ? 'bg-slate-50 border-slate-100 opacity-60 cursor-not-allowed' 
                            : isCurrent
                                ? 'bg-white border-slate-900 shadow-xl scale-105 cursor-pointer ring-4 ring-blue-50'
                                : 'bg-white border-green-200 cursor-pointer hover:border-green-400'
                        }`}
                    >
                        {/* Icone Statut */}
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm z-10 ${
                            isLocked ? 'bg-slate-200 text-slate-400' : 
                            isCompleted ? 'bg-green-500 text-white' : 
                            'bg-slate-900 text-white'
                        }`}>
                            {isLocked && <Lock size={24} />}
                            {isCompleted && <Check size={28} strokeWidth={3} />}
                            {isCurrent && <Play size={28} fill="currentColor" />}
                        </div>

                        <div className="flex-1">
                            <h3 className={`font-extrabold text-lg mb-1 ${isLocked ? 'text-slate-400' : 'text-slate-900'}`}>
                                {mod.title}
                            </h3>
                            <p className={`text-sm font-medium leading-relaxed ${isLocked ? 'text-slate-400' : 'text-slate-500'}`}>
                                {mod.description}
                            </p>
                        </div>

                        {!isLocked && (
                            <div className="hidden sm:block">
                                <button className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors ${
                                    isCompleted ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700 group-hover:bg-blue-100'
                                }`}>
                                    {isCompleted ? 'Revoir' : 'Commencer'}
                                </button>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
      </div>
    );
  }

  // === VUE 2 : APPRENTISSAGE ===
  if (view === 'learning') {
      const currentModule = modules[currentModuleIndex];
      return (
          <div className="max-w-3xl mx-auto py-12 px-6 pb-32">
              <div className="mb-8 flex items-center justify-between">
                  <button onClick={() => setView('map')} className="text-slate-400 hover:text-slate-900 transition-colors">
                      <ArrowLeft size={24} />
                  </button>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                      Module {currentModuleIndex + 1} / {modules.length}
                  </span>
              </div>

              <div className="prose prose-slate prose-lg max-w-none mb-12">
                  <h1>{currentModule.title}</h1>
                  <ReactMarkdown>{currentModule.content}</ReactMarkdown>
              </div>

              <div className="fixed bottom-0 left-0 w-full p-6 bg-white border-t border-slate-100 flex justify-center">
                  <button
                    onClick={handleFinishLearning}
                    className="btn-b-primary w-full max-w-md text-lg py-4 shadow-xl"
                  >
                      J'ai compris, passer au quiz <ArrowRight />
                  </button>
              </div>
          </div>
      );
  }

  // === VUE 3 : QUIZ DE VALIDATION ===
  if (view === 'quiz') {
      const currentModule = modules[currentModuleIndex];
      return (
          <div className="max-w-2xl mx-auto py-12 px-6">
              <h2 className="text-2xl font-black text-slate-900 mb-8 text-center">Vérification des acquis</h2>

              <div className="space-y-8">
                  {currentModule.quiz.map((q, qIdx) => (
                      <div key={qIdx} className="bg-white p-6 rounded-[2rem] border-2 border-slate-100 shadow-sm">
                          <p className="font-bold text-lg mb-4">{q.question}</p>
                          <div className="space-y-3">
                              {q.options.map((opt, oIdx) => (
                                  <button
                                      key={oIdx}
                                      onClick={() => {
                                          const newAns = [...quizAnswers];
                                          newAns[qIdx] = oIdx;
                                          setQuizAnswers(newAns);
                                          setQuizError(null);
                                      }}
                                      className={`w-full text-left p-4 rounded-xl border-2 font-medium transition-all ${
                                          quizAnswers[qIdx] === oIdx
                                          ? 'border-slate-900 bg-slate-900 text-white'
                                          : 'border-slate-100 hover:border-slate-300 text-slate-600'
                                      }`}
                                  >
                                      {opt}
                                  </button>
                              ))}
                          </div>
                      </div>
                  ))}
              </div>

              {quizError && (
                  <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-xl font-bold text-center animate-bounce">
                      {quizError}
                  </div>
              )}

              <button
                onClick={submitQuiz}
                disabled={quizAnswers.includes(-1)}
                className="btn-b-primary w-full mt-8 py-4"
              >
                  Valider le module
              </button>
          </div>
      );
  }

  // === VUE 4 : SUCCÈS ===
  if (view === 'success') {
      return (
          <div className="flex h-screen items-center justify-center bg-white px-6">
              <div className="text-center max-w-md animate-in zoom-in">
                  <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 text-6xl shadow-lg">
                      🎉
                  </div>
                  <h2 className="text-4xl font-black text-slate-900 mb-4">Module Terminé !</h2>
                  <p className="text-slate-500 font-medium text-lg mb-8">
                      Vous avez validé cette étape. Revenez demain pour la suite, ou continuez si vous êtes chaud !
                  </p>
                  <button onClick={() => setView('map')} className="btn-b-primary w-full py-4 text-lg">
                      Retour à la carte
                  </button>
              </div>
          </div>
      );
  }

  return null;
}