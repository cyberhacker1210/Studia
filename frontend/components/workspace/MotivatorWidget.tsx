'use client';

import { useState, useEffect } from 'react';
import {
  ArrowRight,
  Loader2,
  Check,
  Trophy,
  Sparkles,
  Flame,
  RefreshCw,
  Target
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
  const [isLoaded, setIsLoaded] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  // --- 1. CHARGEMENT AU DÉMARRAGE (PERSISTANCE) ---
  useEffect(() => {
    const savedPlan = localStorage.getItem('studia_daily_plan');
    const savedCompleted = localStorage.getItem('studia_completed_tasks');
    const savedGoal = localStorage.getItem('studia_goal'); // On garde aussi l'input

    if (savedPlan) setPlan(JSON.parse(savedPlan));
    if (savedCompleted) setCompletedIds(JSON.parse(savedCompleted));
    if (savedGoal) setGoal(savedGoal);

    setIsLoaded(true);
  }, []);

  // --- 2. SAUVEGARDE AUTOMATIQUE ---
  useEffect(() => {
    if (!isLoaded) return;

    if (plan) {
        localStorage.setItem('studia_daily_plan', JSON.stringify(plan));
    } else {
        localStorage.removeItem('studia_daily_plan');
    }

    localStorage.setItem('studia_completed_tasks', JSON.stringify(completedIds));
    localStorage.setItem('studia_goal', goal);

  }, [plan, completedIds, goal, isLoaded]);


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
        setCompletedIds([]); // Reset des tâches finies
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

  const resetPlan = () => {
      if (confirm("Abandonner cet objectif ?")) {
          setPlan(null);
          setCompletedIds([]);
          setGoal('');
          setDeadline('');
      }
  };

  const progress = plan ? Math.round((completedIds.length / plan.micro_tasks.length) * 100) : 0;

  if (!isLoaded) return null; // Évite le flash au chargement

  return (
    <div className="w-full bg-white rounded-t-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[70vh]">

      {/* HEADER FIXE */}
      <div className="relative p-6 pb-4 border-b border-slate-100 bg-white z-10 shrink-0">
        <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                    <div className="absolute inset-0 bg-orange-500 blur-lg opacity-20 rounded-full"></div>
                    <div className="relative bg-gradient-to-br from-orange-500 to-red-500 w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg transform -rotate-3">
                        <Flame size={20} fill="currentColor" />
                    </div>
                </div>
                <div>
                    <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Objectif du jour</h2>
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                        <span className="text-orange-600 font-bold flex items-center gap-1">
                            <Sparkles size={10} /> IA Coach
                        </span>
                    </div>
                </div>
            </div>

            {plan && (
                <div className="flex flex-col items-end shrink-0">
                    <span className="text-2xl font-black text-slate-900 tabular-nums">{progress}%</span>
                </div>
            )}
        </div>

        {plan && (
            <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden mt-3">
                <div
                    className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-1000 ease-out rounded-full"
                    style={{ width: `${progress}%` }}
                />
            </div>
        )}
      </div>

      {/* ZONE DE CONTENU SCROLLABLE */}
      <div className="p-6 overflow-y-auto custom-scrollbar">
        {!plan ? (
          /* --- CONFIGURATION --- */
          <div className="space-y-4 animate-in fade-in">
                <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Ton But</label>
                    <input
                        type="text"
                        placeholder="Ex: Comprendre la physique..."
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all font-medium text-slate-800 text-sm"
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                    />
                </div>
                <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Deadline</label>
                    <input
                        type="text"
                        placeholder="Ex: Demain soir..."
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all font-medium text-slate-800 text-sm"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                    />
                </div>

            <button
              onClick={generatePlan}
              disabled={loading || !goal || !deadline}
              className="w-full mt-2 bg-slate-900 text-white font-bold py-3 rounded-xl transition-all hover:bg-black disabled:opacity-70 flex items-center justify-center gap-2 text-sm shadow-lg"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : <ArrowRight size={16} />}
              <span>{loading ? "Analyse..." : "Générer le Plan"}</span>
            </button>
          </div>
        ) : (
          /* --- PLAN ACTIF --- */
          <div className="animate-in fade-in space-y-4">

            {/* Citation */}
            <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 relative">
                <Trophy size={40} className="text-orange-200 absolute top-2 right-2 opacity-50" />
                <p className="text-sm font-bold text-slate-800 relative z-10">"{plan.daily_message}"</p>
                <p className="text-xs text-orange-600/80 italic mt-1 relative z-10">{plan.quote}</p>
            </div>

            {/* Liste des tâches */}
            <div className="space-y-2">
              {plan.micro_tasks.map((task: any) => {
                const isDone = completedIds.includes(task.id);
                return (
                  <button
                      key={task.id}
                      onClick={() => handleComplete(task.id, task.xp_reward)}
                      disabled={isDone}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all duration-200 text-left group ${
                          isDone 
                            ? 'bg-green-50 border-green-100 opacity-80' 
                            : 'bg-white border-slate-100 hover:border-orange-300 hover:shadow-md'
                      }`}
                  >
                      <div className="flex items-center gap-3">
                          <div className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                              isDone ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-300 group-hover:text-orange-500'
                          }`}>
                              <Check size={12} strokeWidth={4} />
                          </div>
                          <span className={`text-xs font-bold ${isDone ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                            {task.task}
                          </span>
                      </div>
                      {!isDone && <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">+{task.xp_reward}</span>}
                  </button>
                )
              })}
            </div>

            <button onClick={resetPlan} className="w-full py-2 text-xs font-bold text-slate-400 hover:text-red-500 transition-colors flex items-center justify-center gap-1">
                <RefreshCw size={12}/> Changer d'objectif
            </button>
          </div>
        )}
      </div>
    </div>
  );
}