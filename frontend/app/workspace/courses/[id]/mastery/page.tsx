'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Loader2, ArrowLeft, CheckCircle, Play, Zap, PenTool, ChevronRight, Award } from 'lucide-react';
import { getCourseById } from '@/lib/courseService';
import { addXp } from '@/lib/gamificationService';
import { useEnergy } from '@/hooks/useEnergy';
import JourneyMap from '@/components/workspace/JourneyMap';
import BrilliantQuiz from '@/components/workspace/BrilliantQuiz';
import { supabase } from '@/lib/supabase';
import ReactMarkdown from 'react-markdown';
import confetti from 'canvas-confetti';

export default function MasteryPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const { consumeEnergy, refundEnergy } = useEnergy();

  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'map' | 'learning' | 'practice' | 'quiz' | 'finished'>('map');
  const [modules, setModules] = useState<any[]>([]);
  const [currentModIdx, setCurrentModIdx] = useState(0);

  // États temporaires
  const [practiceInput, setPracticeInput] = useState('');
  const [showSolution, setShowSolution] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => { if (user && params.id) initPath(); }, [user, params.id]);

  const initPath = async () => {
    try {
      // 1. Récupérer progression DB
      const { data: progress } = await supabase.from('course_progress').select('current_module_index').eq('user_id', user!.id).eq('course_id', params.id).maybeSingle();
      const savedIndex = progress?.current_module_index || 0;

      // Si tout est fini
      if (savedIndex >= 3) { // Supposons 3 modules max
          setView('finished');
          setLoading(false);
          return;
      }

      setCurrentModIdx(savedIndex);

      // 2. Récupérer ou Générer Contenu
      const cached = localStorage.getItem(`path_hardcore_${params.id}`);
      if (cached) {
          setModules(JSON.parse(cached));
          setLoading(false);
      } else {
          const canProceed = await consumeEnergy(2);
          if (!canProceed) { router.push('/workspace/pricing'); return; }

          const course = await getCourseById(Number(params.id), user!.id);
          const res = await fetch(`${API_URL}/api/path/generate`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ course_text: course.extracted_text }),
          });

          if (!res.ok) throw new Error("Erreur API");
          const data = await res.json();

          if (!data.modules) throw new Error("Données invalides");

          // On formate les statuts
          const formatted = data.modules.map((m: any, i: number) => ({
              ...m,
              status: i < savedIndex ? 'completed' : i === savedIndex ? 'current' : 'locked'
          }));

          setModules(formatted);
          localStorage.setItem(`path_hardcore_${params.id}`, JSON.stringify(formatted));
          setLoading(false);
      }
    } catch (e) {
        console.error(e);
        await refundEnergy(2);
        alert("Erreur de chargement du parcours.");
        router.push('/workspace/courses');
    }
  };

  const startModule = (idx: number) => {
      setCurrentModIdx(idx);
      setView('learning');
  };

  const handleFinishLearning = () => {
      window.scrollTo(0,0);
      setView('practice'); // On passe à la pratique AVANT le quiz
  };

  const handleFinishPractice = () => {
      setPracticeInput('');
      setShowSolution(false);
      window.scrollTo(0,0);
      setView('quiz');
  };

  const handleQuizSuccess = async () => {
      const nextIndex = currentModIdx + 1;

      // Mise à jour locale
      const newModules = [...modules];
      newModules[currentModIdx].status = 'completed';
      if (nextIndex < newModules.length) newModules[nextIndex].status = 'current';
      setModules(newModules);

      // Sauvegarde DB
      await supabase.from('course_progress').upsert({
          user_id: user!.id, course_id: Number(params.id), current_module_index: nextIndex
      }, { onConflict: 'user_id,course_id' });

      await addXp(user!.id, 300, 'Module Maîtrisé');

      if (nextIndex >= modules.length) {
          setView('finished'); // FIN TOTALE
          triggerFinalCelebration();
      } else {
          setView('map');
      }
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

  const currentModule = modules[currentModIdx];

  // --- VUES ---

  if (view === 'finished') {
      return (
          <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 text-center text-white">
              <div className="max-w-lg animate-in zoom-in duration-700">
                  <div className="mb-8 relative inline-block">
                      <div className="absolute inset-0 bg-yellow-500 blur-3xl opacity-20 rounded-full"></div>
                      <Award size={120} className="text-yellow-400 relative z-10 animate-bounce-slow" />
                  </div>
                  <h1 className="text-5xl font-black mb-6 bg-gradient-to-r from-yellow-200 to-yellow-500 bg-clip-text text-transparent">LÉGENDAIRE !</h1>
                  <p className="text-xl text-slate-300 mb-10">Vous avez terminé ce cours à 100%. Votre maîtrise est totale.</p>
                  <div className="bg-white/10 p-6 rounded-2xl border border-white/10 mb-10">
                      <div className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-2">Récompense Totale</div>
                      <div className="text-4xl font-black text-white">+1000 XP</div>
                  </div>
                  <button onClick={() => router.push('/workspace')} className="btn-b-primary bg-white text-slate-900 border-slate-200 hover:bg-slate-100 w-full">
                      Retour au QG
                  </button>
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
                  <p className="text-slate-500">Niveau Universitaire • {modules.length} Modules</p>
              </div>
              <JourneyMap modules={modules} onModuleClick={startModule} />
          </div>
      );
  }

  if (view === 'learning') {
      return (
          <div className="max-w-3xl mx-auto py-12 px-6 pb-32">
              <div className="flex items-center gap-3 mb-8 text-sm font-bold text-slate-400 uppercase tracking-wider">
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg">Théorie</span>
                  <span>{currentModule.title}</span>
              </div>
              <article className="prose prose-slate prose-lg max-w-none mb-16">
                  <ReactMarkdown>{currentModule.content}</ReactMarkdown>
              </article>
              <button onClick={handleFinishLearning} className="btn-b-primary w-full py-4 text-lg shadow-xl">
                  Passer à la pratique <ChevronRight />
              </button>
          </div>
      );
  }

  if (view === 'practice') {
      return (
          <div className="max-w-3xl mx-auto py-12 px-6 pb-32">
              <div className="flex items-center gap-3 mb-8 text-sm font-bold text-slate-400 uppercase tracking-wider">
                  <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-lg">Pratique</span>
                  <span>Mise en situation</span>
              </div>

              <div className="bg-white border-2 border-slate-100 rounded-[2rem] p-8 shadow-sm mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                      <PenTool className="text-purple-600"/> Étude de Cas
                  </h2>
                  <p className="text-lg text-slate-700 font-medium leading-relaxed mb-6">
                      {currentModule.practice?.instruction || "Pas d'exercice pour ce module."}
                  </p>

                  {!showSolution ? (
                      <div className="space-y-4">
                          <textarea
                              className="w-full h-40 p-4 rounded-xl bg-slate-50 border-2 border-slate-200 focus:border-purple-500 outline-none transition-all text-slate-900"
                              placeholder="Écrivez votre analyse ici..."
                              value={practiceInput}
                              onChange={(e) => setPracticeInput(e.target.value)}
                          />
                          <button
                              onClick={() => setShowSolution(true)}
                              disabled={practiceInput.length < 10}
                              className="btn-b-primary w-full disabled:opacity-50"
                          >
                              Comparer avec la correction
                          </button>
                      </div>
                  ) : (
                      <div className="animate-in fade-in slide-in-from-bottom-4">
                          <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-r-xl mb-8">
                              <h3 className="font-bold text-green-800 mb-3">Points clés de la correction :</h3>
                              <ul className="list-disc list-inside space-y-2 text-green-900">
                                  {currentModule.practice?.solution_key_points?.map((pt: string, i: number) => (
                                      <li key={i}>{pt}</li>
                                  )) || <li>Correction non disponible.</li>}
                              </ul>
                          </div>
                          <div className="text-center">
                              <p className="text-slate-500 mb-4 font-medium">Avez-vous trouvé les points essentiels ?</p>
                              <button onClick={handleFinishPractice} className="btn-b-primary bg-green-600 border-green-800 hover:bg-green-500 w-full">
                                  Oui, je valide <CheckCircle className="ml-2"/>
                              </button>
                          </div>
                      </div>
                  )}
              </div>
          </div>
      );
  }

  if (view === 'quiz') {
      return (
          <div className="max-w-3xl mx-auto py-12 px-6">
              <div className="mb-8 text-center">
                  <span className="bg-red-100 text-red-700 px-3 py-1 rounded-lg font-bold text-xs uppercase tracking-wider">
                      Validation Finale
                  </span>
                  <h2 className="text-3xl font-black text-slate-900 mt-4">Prouvez votre maîtrise</h2>
              </div>
              <BrilliantQuiz
                  questions={currentModule.quiz}
                  onComplete={(score) => handleQuizComplete(score)}
                  onXpGain={(xp) => addXp(user!.id, xp, "Quiz")}
              />
          </div>
      );
  }

  return null;
}