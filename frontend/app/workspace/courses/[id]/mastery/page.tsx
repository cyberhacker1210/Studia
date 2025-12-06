'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Loader2, ArrowLeft, PenTool, ChevronRight, Award, RotateCcw, CheckCircle, Layers, Brain } from 'lucide-react';
import { getCourseById } from '@/lib/courseService';
import { addXp } from '@/lib/gamificationService';
import { useEnergy } from '@/hooks/useEnergy'; // Utilise le hook corrigé
import JourneyMap from '@/components/workspace/JourneyMap';
import BrilliantQuiz from '@/components/workspace/BrilliantQuiz';
import FlashcardViewer from '@/components/workspace/FlashcardViewer';
import { supabase } from '@/lib/supabase';
import ReactMarkdown from 'react-markdown';
import confetti from 'canvas-confetti';

interface Module {
  title: string;
  description: string;
  type: 'diagnostic' | 'remediation' | 'deep_dive' | 'final_review' | 'exam';
  status: 'locked' | 'current' | 'completed';
  content?: string;
  quiz?: any[];
  flashcards?: any[];
  practice?: any;
}

export default function MasteryPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();

  // Hook Énergie
  const { consumeEnergy, refundEnergy } = useEnergy();

  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'map' | 'quiz' | 'flashcards' | 'learning' | 'practice' | 'finished'>('map');
  const [modules, setModules] = useState<Module[]>([]);
  const [currentModIdx, setCurrentModIdx] = useState(0);

  const [practiceInput, setPracticeInput] = useState('');
  const [showSolution, setShowSolution] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => { if (user && params.id) initPath(); }, [user, params.id]);

  const initPath = async () => {
    try {
      const { data: progress } = await supabase.from('course_progress').select('current_module_index').eq('user_id', user!.id).eq('course_id', params.id).maybeSingle();
      const savedIndex = progress?.current_module_index || 0;
      setCurrentModIdx(savedIndex);

      const cached = localStorage.getItem(`path_studia_v3_${params.id}`);
      let loadedModules = [];

      if (cached) {
          loadedModules = JSON.parse(cached);
          setModules(loadedModules);
          setLoading(false);
      } else {
          // ⚡️ DÉBIT ÉNERGIE (COÛT 3 POUR LE PARCOURS COMPLET)
          const canProceed = await consumeEnergy(3);

          if (!canProceed) {
              // Si pas assez d'énergie, on redirige immédiatement
              if(confirm("⚡️ Pas assez d'énergie ! Il faut 3 éclairs pour générer ce parcours complet.")) {
                  router.push('/workspace/pricing');
              } else {
                  router.push('/workspace/courses');
              }
              return;
          }

          const course = await getCourseById(Number(params.id), user!.id);
          const res = await fetch(`${API_URL}/api/path/generate`, {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ course_text: course.extracted_text }),
          });

          if (!res.ok) throw new Error("Erreur API");
          const data = await res.json();

          if (!data.modules) {
              await refundEnergy(3); // Remboursement en cas d'erreur IA
              throw new Error("Données invalides");
          }

          loadedModules = data.modules.map((m: any, i: number) => ({
              ...m,
              status: i < savedIndex ? 'completed' : i === savedIndex ? 'current' : 'locked'
          }));

          setModules(loadedModules);
          localStorage.setItem(`path_studia_v3_${params.id}`, JSON.stringify(loadedModules));
          setLoading(false);
      }

      if (savedIndex >= loadedModules.length && loadedModules.length > 0) {
          setView('finished');
      }

    } catch (e) {
        console.error(e);
        alert("Erreur de chargement.");
        router.push('/workspace/courses');
    }
  };

  const startModule = (idx: number) => {
      const mod = modules[idx];
      setCurrentModIdx(idx);

      // Router selon le type de module
      if (mod.type === 'diagnostic' || mod.type === 'final_review') {
          setView('quiz');
      } else if (mod.type === 'remediation') {
          setView('flashcards');
      } else if (mod.type === 'deep_dive') {
          setView('learning');
      } else if (mod.type === 'exam') {
          setView('practice');
      }
  };

  const handleNextStep = async () => {
      const nextIndex = currentModIdx + 1;

      const newModules = [...modules];
      newModules[currentModIdx].status = 'completed';
      if (nextIndex < newModules.length) newModules[nextIndex].status = 'current';
      setModules(newModules);

      await supabase.from('course_progress').upsert({
          user_id: user!.id, course_id: Number(params.id), current_module_index: nextIndex
      }, { onConflict: 'user_id,course_id' });

      addXp(user!.id, 150, 'Module Validé');

      if (nextIndex >= modules.length) {
          setView('finished');
          triggerFinalCelebration();
      } else {
          setView('map');
      }
  };

  // --- HANDLERS SPÉCIFIQUES ---

  const handleQuizComplete = (score: number) => {
      // Pour le diagnostic, on passe peu importe le score (c'est pour savoir)
      // Pour la validation, il faut 70%
      const current = modules[currentModIdx];
      const total = current.quiz?.length || 1;

      if (current.type === 'diagnostic' || (score / total) >= 0.7) {
          handleNextStep();
      } else {
          alert("Score insuffisant pour valider ce module. Révisez encore !");
          setView('map');
      }
  };

  const handleFlashcardsDone = () => {
      handleNextStep();
  };

  const handleLearningDone = () => {
      // Après lecture, petit quiz de vérif s'il existe
      if (modules[currentModIdx].quiz && modules[currentModIdx].quiz.length > 0) {
          setView('quiz');
      } else {
          handleNextStep();
      }
  };

  const handlePracticeDone = () => {
      handleNextStep();
  };

  const triggerFinalCelebration = () => {
      const duration = 3000;
      const end = Date.now() + duration;
      (function frame() {
        confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 } });
        confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 } });
        if (Date.now() < end) requestAnimationFrame(frame);
      }());
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin"/></div>;

  const current = modules[currentModIdx];

  // --- VUES ---

  if (view === 'finished') {
      return (
          <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 text-center text-white animate-in zoom-in">
              <div className="max-w-lg">
                  <Award size={120} className="text-yellow-400 mx-auto mb-6 animate-bounce" />
                  <h1 className="text-5xl font-black mb-6 text-yellow-400">LÉGENDAIRE !</h1>
                  <p className="text-xl text-slate-300 mb-10">Vous maîtrisez ce cours à la perfection.</p>
                  <button onClick={() => router.push('/workspace')} className="btn-b-primary bg-white text-slate-900 w-full">Retour au QG</button>
              </div>
          </div>
      );
  }

  if (view === 'map') {
      return (
          <div className="pb-20 pt-10 px-4 max-w-2xl mx-auto">
              <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 font-bold text-sm mb-8 hover:text-slate-900"><ArrowLeft size={18}/> Retour</button>
              <div className="text-center mb-16">
                  <h1 className="text-4xl font-black text-slate-900 mb-2">Parcours de Maîtrise</h1>
                  <p className="text-slate-500">Méthode Studia • {modules.length} Étapes</p>
              </div>
              <JourneyMap modules={modules} onModuleClick={startModule} />
          </div>
      );
  }

  if (view === 'quiz') {
      return (
          <div className="max-w-3xl mx-auto py-12 px-6 animate-in slide-in-from-right-8">
              <div className="mb-8 text-center">
                  <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-1 rounded-full text-xs font-bold uppercase mb-4"><Brain size={12}/> Quiz</div>
                  <h2 className="text-3xl font-black text-slate-900">{current.title}</h2>
              </div>
              <BrilliantQuiz
                  questions={current.quiz || []}
                  onComplete={handleQuizComplete}
                  onXpGain={(xp) => addXp(user!.id, xp, "Quiz")}
              />
          </div>
      );
  }

  if (view === 'flashcards') {
      return (
          <div className="max-w-3xl mx-auto py-12 px-6 animate-in slide-in-from-right-8">
              <div className="mb-8 text-center">
                  <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-600 px-4 py-1 rounded-full text-xs font-bold uppercase mb-4"><Layers size={12}/> Flashcards</div>
                  <h2 className="text-3xl font-black text-slate-900">{current.title}</h2>
              </div>
              <FlashcardViewer flashcards={current.flashcards || []} />
              <div className="text-center mt-12">
                  <button onClick={handleFlashcardsDone} className="btn-b-primary px-12">J'ai fini de réviser</button>
              </div>
          </div>
      );
  }

  if (view === 'learning') {
      return (
          <div className="max-w-3xl mx-auto py-12 px-6 pb-32 animate-in slide-in-from-right-8">
              <div className="flex items-center gap-3 mb-8 text-sm font-bold text-slate-400 uppercase tracking-wider">
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg">Théorie</span>
                  <span>{current.title}</span>
              </div>
              <article className="prose prose-slate prose-lg max-w-none mb-16">
                  <ReactMarkdown>{current.content || "Contenu vide"}</ReactMarkdown>
              </article>
              <button onClick={handleLearningDone} className="btn-b-primary w-full py-4 text-lg shadow-xl">
                  Passer au test <ChevronRight />
              </button>
          </div>
      );
  }

  if (view === 'practice') {
      return (
          <div className="max-w-3xl mx-auto py-12 px-6 pb-32 animate-in slide-in-from-right-8">
              <div className="bg-white border-2 border-slate-100 rounded-[2rem] p-8 shadow-sm mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3"><PenTool className="text-purple-600"/> Examen Blanc (DS)</h2>
                  <p className="text-lg text-slate-700 font-medium leading-relaxed mb-6">{current.practice?.instruction}</p>
                  {!showSolution ? (
                      <div className="space-y-4">
                          <textarea className="w-full h-64 p-4 rounded-xl bg-slate-50 border-2 border-slate-200 focus:border-purple-500 outline-none" placeholder="Rédigez votre réponse complète ici..." value={practiceInput} onChange={(e) => setPracticeInput(e.target.value)}/>
                          <button onClick={() => setShowSolution(true)} disabled={practiceInput.length < 20} className="btn-b-primary w-full disabled:opacity-50">Voir la correction type</button>
                      </div>
                  ) : (
                      <div className="animate-in fade-in">
                          <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-r-xl mb-8">
                              <h3 className="font-bold text-green-800 mb-3">Points attendus dans la copie :</h3>
                              <ul className="list-disc list-inside space-y-2 text-green-900">
                                  {current.practice?.solution_key_points?.map((pt: string, i: number) => <li key={i}>{pt}</li>)}
                              </ul>
                          </div>
                          <button onClick={handlePracticeDone} className="btn-b-primary bg-green-600 border-green-800 w-full">Je valide mon DS <CheckCircle className="ml-2"/></button>
                      </div>
                  )}
              </div>
          </div>
      );
  }

  return null;
}