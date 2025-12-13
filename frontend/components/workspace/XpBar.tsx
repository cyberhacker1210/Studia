'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { getUserProgress, UserProgress } from '@/lib/gamificationService';
import { Zap } from 'lucide-react';

export default function XpBar() {
  const { user } = useUser();
  const [progress, setProgress] = useState<UserProgress | null>(null);

  const loadProgress = async () => {
    if (!user) return;
    const data = await getUserProgress(user.id);
    setProgress(data);
  };

  useEffect(() => {
    if (user) {
      loadProgress();
      // Écouteur d'événement pour mise à jour instantanée
      window.addEventListener('xp-updated', loadProgress);
      return () => window.removeEventListener('xp-updated', loadProgress);
    }
  }, [user]);

  if (!progress) return null;

  return (
    <div className="flex items-center gap-3 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200 shadow-sm select-none">
      <div className="flex flex-col items-end">
        <span className="text-xs font-black text-slate-900 leading-none">
          Niv. {progress.level}
        </span>
        <span className="text-[10px] text-slate-500 leading-none font-bold">
          {progress.xp} XP
        </span>
      </div>

      <div className="relative w-9 h-9 flex items-center justify-center group cursor-help">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="18" cy="18" r="15" stroke="#cbd5e1" strokeWidth="3" fill="transparent" />
          <circle
            cx="18" cy="18" r="15"
            stroke="#eab308" strokeWidth="3" fill="transparent"
            strokeDasharray={94}
            strokeDashoffset={94 - (94 * progress.progress_percent) / 100}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <Zap size={14} className="absolute text-yellow-500 fill-yellow-500 group-hover:scale-110 transition-transform" />

        {/* Tooltip */}
        <div className="absolute top-10 right-0 bg-slate-900 text-white text-[10px] font-bold p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity w-max shadow-xl pointer-events-none z-50">
          Prochain niveau : {progress.next_level_xp} XP
        </div>
      </div>
    </div>
  );
}