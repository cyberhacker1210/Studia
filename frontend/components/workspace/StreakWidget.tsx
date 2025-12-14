'use client';

import { Flame, Check } from 'lucide-react';

interface StreakWidgetProps {
  streak: number;
  activeToday: boolean;
}

export default function StreakWidget({ streak, activeToday }: StreakWidgetProps) {

  // Couleur dynamique selon la série
  let fireColor = "text-orange-500 fill-orange-500";
  let bgGradient = "from-orange-500 to-red-500";

  if (streak >= 7) { fireColor = "text-purple-500 fill-purple-500"; bgGradient = "from-purple-500 to-pink-500"; }
  if (streak >= 30) { fireColor = "text-blue-500 fill-blue-500"; bgGradient = "from-blue-500 to-cyan-500"; }

  const days = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

  return (
    <div className="bg-white border-2 border-slate-100 rounded-[2rem] p-6 shadow-sm relative overflow-hidden group">

        {/* Glow effect */}
        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${bgGradient} opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-opacity`}></div>

        <div className="flex justify-between items-start mb-6 relative z-10">
            <div>
                <h3 className="text-lg font-black text-slate-900 mb-1">Série en cours</h3>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Ne brisez pas la chaîne !</p>
            </div>
            <div className="flex flex-col items-center">
                <Flame size={32} className={`${fireColor} animate-pulse drop-shadow-sm`} />
                <span className={`text-2xl font-black ${fireColor.split(' ')[0]}`}>{streak}</span>
            </div>
        </div>

        {/* Semaine */}
        <div className="flex justify-between items-center relative z-10">
            {days.map((day, idx) => {
                const isPast = idx < todayIndex;
                const isToday = idx === todayIndex;
                // Simulation simple : si passé, on suppose validé pour l'exemple visuel (à connecter à la BDD plus tard)
                // Ici, seul aujourd'hui change d'état
                const isActive = isToday ? activeToday : (isPast && streak > (todayIndex - idx));

                return (
                    <div key={idx} className="flex flex-col items-center gap-2">
                        <span className={`text-[10px] font-bold ${isToday ? 'text-slate-900' : 'text-slate-400'}`}>{day}</span>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                            isActive 
                            ? `bg-gradient-to-br ${bgGradient} border-transparent text-white shadow-md scale-110` 
                            : 'bg-slate-50 border-slate-100 text-slate-300'
                        }`}>
                            {isActive && <Check size={14} strokeWidth={4} />}
                        </div>
                    </div>
                );
            })}
        </div>
    </div>
  );
}