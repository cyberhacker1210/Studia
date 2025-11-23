'use client';

import { useState } from 'react';
import {
  ArrowRight,
  Loader2,
  Check,
  Trophy,
  Sparkles,
  Flame
} from 'lucide-react';
import { addXp } from '@/lib/gamificationService';
import { useUser } from '@clerk/nextjs';

export default function MotivatorWidget() {
  const { user } = useUser();
  const [goal, setGoal] = useState('');
  const [deadline, setDeadline] = useState('');
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [completedIds, setCompletedIds] = useState<number[]>([]);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const generatePlan = async () => {
    if (!goal || !deadline) return;

    setLoading(true);
    try {
        const res = await fetch(`${API_URL}/api/motivation/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                goal: goal,
                deadline: deadline,
                current_xp: 1200
            }),
        });
        const data = await res.json();
        setPlan(data);
    } catch (err) {
        console.error(err);
    } finally {
        setLoading(false);
    }
  };

  const handleComplete = async (id: number, xp: number) => {
      if (completedIds.includes(id)) return;
      setCompletedIds([...completedIds, id]);
      if (user) await addXp(user.id, xp, 'Micro-tâche motivateur');
  };

  const progress = plan ? Math.round((completedIds.length / plan.micro_tasks.length) * 100) : 0;

  return (
    <div className="w-full bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">

      {/* Header */}
      <div className="relative p-6 pb-0">
        <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                    <div className="absolute inset-0 bg-orange-500 blur-lg opacity-20 rounded-full"></div>
                    <div className="relative bg-gradient-to-br from-orange-500 to-red-500 w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-500/20 transform rotate-3">
                        <Flame size={24} fill="currentColor" className="text-white/90" />
                    </div>
                </div>
                <div>
                    <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Objectif du jour</h2>
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                        <span className="flex items-center gap-1 text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full whitespace-nowrap">
                            <Sparkles size={10} />
                            IA Coach
                        </span>
                        <span className="hidden sm:inline">• Boost de productivité</span>
                    </div>
                </div>
            </div>

            {plan && (
                <div className="flex flex-col items-end shrink-0">
                    <span className="text-3xl font-black text-gray-900 tabular-nums">{progress}%</span>
                    <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Complété</span>
                </div>
            )}
        </div>

        {plan && (
            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden mt-4">
                <div
                    className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-1000 ease-out rounded-full"
                    style={{ width: `${progress}%` }}
                />
            </div>
        )}
      </div>

      <div className="p-6 pt-6">
        {!plan ? (
          /* --- ETAT 1 : CONFIGURATION --- */
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">

            <div className="space-y-4">
                <div className="group relative w-full">
                    <label className="text-xs font-bold text-gray-400 uppercase ml-1 mb-1 block">Ton But Principal</label>
                    <input
                        type="text"
                        placeholder="Ex: Comprendre la physique quantique"
                        className="w-full px-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-orange-500/20 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all font-medium text-gray-800 placeholder:text-gray-400"
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                    />
                </div>

                <div className="group relative w-full">
                    <label className="text-xs font-bold text-gray-400 uppercase ml-1 mb-1 block">Date Limite</label>
                    <input
                        type="text"
                        placeholder="Ex: Demain soir, Lundi prochain..."
                        className="w-full px-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-orange-500/20 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all font-medium text-gray-800 placeholder:text-gray-400"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                    />
                </div>
            </div>

            <button
              onClick={generatePlan}
              disabled={loading || !goal || !deadline}
              className="w-full relative group overflow-hidden bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-4 rounded-2xl transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:transform-none shadow-xl shadow-orange-500/20 hover:shadow-orange-500/40"
            >
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
              <div className="relative flex items-center justify-center gap-3">
                {loading ? <Loader2 className="animate-spin" /> : <ArrowRight size={20} />}
                <span>{loading ? "L'IA analyse ton objectif..." : "Générer le Plan Tactique"}</span>
              </div>
            </button>
          </div>
        ) : (
          /* --- ETAT 2 : PLAN ACTIF --- */
          <div className="animate-in zoom-in-95 duration-500">
            <div className="bg-gradient-to-r from-orange-50 via-red-50 to-white p-5 rounded-2xl border border-orange-100/50 mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 opacity-10 transform translate-x-2 -translate-y-2 pointer-events-none">
                    <Trophy size={64} className="text-orange-500" />
                </div>
                <p className="text-sm font-bold text-gray-800 relative z-10">"{plan.daily_message}"</p>
                <p className="text-xs text-orange-600/80 italic mt-2 relative z-10 font-medium">{plan.quote}</p>
            </div>

            <div className="space-y-3">
              {plan.micro_tasks.map((task: any) => {
                const isDone = completedIds.includes(task.id);
                return (
                  <button
                      key={task.id}
                      onClick={() => handleComplete(task.id, task.xp_reward)}
                      disabled={isDone}
                      className={`w-full group relative flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-300 text-left overflow-hidden ${
                          isDone 
                            ? 'bg-green-50/50 border-green-100' 
                            : 'bg-white border-gray-100 hover:border-orange-200 hover:shadow-lg hover:shadow-orange-500/5'
                      }`}
                  >
                      <div className="flex items-center gap-4 z-10">
                          <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-500 ${
                              isDone 
                                ? 'bg-green-500 text-white scale-110 rotate-0' 
                                : 'bg-gray-100 text-gray-300 group-hover:bg-orange-100 group-hover:text-orange-500'
                          }`}>
                              <Check size={14} strokeWidth={3} />
                          </div>
                          <div>
                            <span className={`text-sm font-semibold transition-colors ${isDone ? 'text-gray-400 line-through decoration-2 decoration-green-200' : 'text-gray-700'}`}>
                                {task.task}
                            </span>
                          </div>
                      </div>

                      {!isDone && (
                          <div className="flex flex-col items-end z-10 shrink-0 ml-2">
                             <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm shadow-orange-200 whitespace-nowrap">
                                +{task.xp_reward} XP
                             </span>
                          </div>
                      )}
                      <div className={`absolute inset-0 bg-green-50 transition-transform duration-500 origin-left ${isDone ? 'scale-x-100' : 'scale-x-0'}`} />
                  </button>
                )
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-50 flex justify-center">
                {progress === 100 ? (
                    <button onClick={() => setPlan(null)} className="text-sm font-bold text-green-600 flex items-center gap-2 hover:underline">
                        <Trophy size={16} />
                        Mission accomplie ! Nouvel objectif ?
                    </button>
                ) : (
                    <button onClick={() => setPlan(null)} className="text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors">
                        Changer d'objectif
                    </button>
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}