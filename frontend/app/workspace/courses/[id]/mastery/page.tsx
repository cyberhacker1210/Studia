'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Loader2, ArrowLeft, AlertTriangle, Zap, CheckCircle } from 'lucide-react';
import { getCourseById } from '@/lib/courseService';
import { addXp } from '@/lib/gamificationService';
import { useEnergy } from '@/hooks/useEnergy';
import JourneyMap from '@/components/workspace/JourneyMap';
import BrilliantQuiz from '@/components/workspace/BrilliantQuiz';
import { supabase } from '@/lib/supabase';

interface Module {
  title: string;
  description: string;
  status: 'locked' | 'current' | 'completed';
  data?: any
}

export default function MasteryPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const { consumeEnergy, refundEnergy } = useEnergy();

  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'map' | 'quiz'>('map');
  const [modules, setModules] = useState<Module[]>([]);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [currentQuizData, setCurrentQuizData] = useState<any>(null);
  const [showLevelUp, setShowLevelUp] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    if (user && params.id) initPath();
  }, [user, params.id]);

  const initPath = async () => {
    try {
      // 1. Récupérer la progression sauvegardée en base
      const { data: progress } = await supabase
        .from('course_progress')
        .select('current_module_index')
        .eq('user_id', user!.id)
        .eq('course_id', params.id)
        .single();

      const savedIndex = progress?.current_module_index || 0;
      setCurrentModuleIndex(savedIndex);

      // 2. Récupérer ou Générer la structure
      const cached = localStorage.getItem(`path_structure_${params.id}`);
      let rawModules = [];

      if (cached) {
        rawModules = JSON.parse(cached);
        setLoading(false);
      } else {
        // Génération IA (Coût 2 éclairs)
        await consumeEnergy(2);
        const course = await getCourseById(Number(params.id), user!.id);
        const res = await fetch(`${API_URL}/api/path/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ course_text: course.extracted_text }),
        });
        const data = await res.json();
        rawModules = data.modules;
        localStorage.setItem(`path_structure_${params.id}`, JSON.stringify(rawModules));
        setLoading(false);
      }

      // 3. Appliquer les statuts (Locked/Current/Completed)
      const formattedModules = rawModules.map((m: any, i: number) => ({
          title: m.title,
          description: m.description,
          data: m,
          status: i < savedIndex ? 'completed' : i === savedIndex ? 'current' : 'locked'
      }));

      setModules(formattedModules);

    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const startModule = (index: number) => {
      const mod = modules[index];
      setCurrentQuizData(mod.data.quiz);
      setView('quiz');
  };

  const handleQuizComplete = async (score: number) => {
      // Logique de réussite : Score > 50%
      const total = currentQuizData.length;
      const passed = (score / total) >= 0.5;

      if (passed) {
          // 🎉 RÉUSSITE -> DÉBLOCAGE SUIVANT
          setShowLevelUp(true);

          const nextIndex = currentModuleIndex + 1;

          // Mise à jour locale
          const newModules = [...modules];
          newModules[currentModuleIndex].status = 'completed';
          if (nextIndex < newModules.length) {
              newModules[nextIndex].status = 'current';
          }
          setModules(newModules);
          setCurrentModuleIndex(nextIndex);

          // Mise à jour DB
          await supabase.from('course_progress').upsert({
              user_id: user!.id,
              course_id: Number(params.id),
              current_module_index: nextIndex
          }, { onConflict: 'user_id,course_id' });

          // XP
          addXp(user!.id, 100, "Module validé");

          setTimeout(() => {
              setShowLevelUp(false);
              setView('map');
          }, 3000); // Animation pendant 3 secondes

      } else {
          // ÉCHEC -> On reste sur le quiz
          alert(`Score insuffisant (${score}/${total}). Révisez et réessayez !`);
          setView('map'); // Ou on le laisse recommencer
      }
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin"/></div>;

  if (showLevelUp) {
      return (
          <div className="fixed inset-0 bg-slate-900/90 z-50 flex items-center justify-center animate-in zoom-in">
              <div className="text-center text-white">
                  <div className="w-32 h-32 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                      <CheckCircle size={64} className="text-slate-900"/>
                  </div>
                  <h2 className="text-4xl font-black mb-2">NIVEAU SUPÉRIEUR !</h2>
                  <p className="text-xl opacity-80">Module validé. La suite vous attend.</p>
              </div>
          </div>
      );
  }

  return (
    <div className="pb-20">
        {view === 'map' && (
            <div className="animate-in fade-in">
                <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 font-bold text-sm mb-8 p-4">
                    <ArrowLeft size={18}/> Retour
                </button>

                <div className="text-center mb-12">
                    <h1 className="text-3xl font-black text-slate-900 mb-2">Votre Aventure</h1>
                    <p className="text-slate-500">Complétez chaque étape pour maîtriser le cours.</p>
                </div>

                <JourneyMap modules={modules} onModuleClick={startModule} />
            </div>
        )}

        {view === 'quiz' && currentQuizData && (
            <div className="animate-in slide-in-from-right-8 p-4">
                <button onClick={() => setView('map')} className="mb-8 text-sm font-bold text-slate-400">Quitter</button>
                <BrilliantQuiz
                    questions={currentQuizData}
                    onComplete={handleQuizComplete}
                    onXpGain={(xp) => addXp(user!.id, xp, "Quiz")}
                />
            </div>
        )}
    </div>
  );
}