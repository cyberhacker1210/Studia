'use client';

import { useState, useEffect } from 'react';
import { ArrowRight, Loader2, Check, Trophy, Sparkles, RefreshCw } from 'lucide-react';
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

  useEffect(() => {
    const savedPlan = localStorage.getItem('studia_daily_plan');
    const savedCompleted = localStorage.getItem('studia_completed_tasks');
    const savedGoal = localStorage.getItem('studia_goal');

    if (savedPlan) setPlan(JSON.parse(savedPlan));
    if (savedCompleted) setCompletedIds(JSON.parse(savedCompleted));
    if (savedGoal) setGoal(savedGoal);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    if (plan) localStorage.setItem('studia_daily_plan', JSON.stringify(plan));
    else localStorage.removeItem('studia_daily_plan');
    localStorage.setItem('studia_completed_tasks', JSON.stringify(completedIds));
    localStorage.setItem('studia_goal', goal);
  }, [plan, completedIds, goal, isLoaded]);

  const generatePlan = async () => {
    if (!goal || !deadline) return;
    setLoading(true);
    try {
        const res = await fetch(`${API_URL}/api/motivation/generate`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ goal, deadline, current_xp: 1200 }),
        });
        const data = await res.json();
        setPlan(data); setCompletedIds([]);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleComplete = async (id: number, xp: number) => {
      if (completedIds.includes(id)) return;
      setCompletedIds([...completedIds, id]);
      if (user) await addXp(user.id, xp, 'Micro-tâche');
  };

  const resetPlan = () => {
      if (confirm("Abandonner ?")) {
          setPlan(null); setCompletedIds([]); setGoal(''); setDeadline('');
      }
  };

  const progress = plan ? Math.round((completedIds.length / plan.micro_tasks.length) * 100) : 0;
  if (!isLoaded) return null;

  // Design "Carte Brilliant" (Blanc, Bordure grise, Compact)
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">

      {plan && (
        <div className="h-1.5 w-full bg-gray-100">
            <div className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-1000" style={{ width: `${progress}%` }} />
        </div>
      )}

      <div className="p-5">
        {!plan ? (
          <div className="space-y-3">
            <input
                type="text" placeholder="Objectif (ex: Chapitre 1)"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium outline-none focus:border-black transition-colors"
                value={goal} onChange={(e) => setGoal(e.target.value)}
            />
            <input
                type="text" placeholder="Deadline (ex: Demain)"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium outline-none focus:border-black transition-colors"
                value={deadline} onChange={(e) => setDeadline(e.target.value)}
            />
            <button
              onClick={generatePlan} disabled={loading || !goal}
              className="w-full bg-black text-white font-bold py-2.5 rounded-lg text-sm hover:bg-gray-800 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={14}/> : <Sparkles size={14}/>} Générer
            </button>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in">
            <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
                <p className="text-xs font-bold text-gray-800">"{plan.daily_message}"</p>
            </div>
            <div className="space-y-2">
              {plan.micro_tasks.map((task: any) => {
                const isDone = completedIds.includes(task.id);
                return (
                  <button
                      key={task.id} onClick={() => handleComplete(task.id, task.xp_reward)} disabled={isDone}
                      className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-left transition-all ${isDone ? 'bg-green-50 border-green-100' : 'bg-white border-gray-100 hover:border-gray-300'}`}
                  >
                      <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isDone ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'}`}>
                              {isDone && <Check size={10} strokeWidth={4} />}
                          </div>
                          <span className={`text-xs font-bold ${isDone ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{task.task}</span>
                      </div>
                  </button>
                )
              })}
            </div>
            <button onClick={resetPlan} className="text-xs font-bold text-gray-400 hover:text-red-500 flex items-center gap-1 mx-auto"><RefreshCw size={10}/> Reset</button>
          </div>
        )}
      </div>
    </div>
  );
}