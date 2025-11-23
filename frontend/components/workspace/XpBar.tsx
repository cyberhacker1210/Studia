'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { getUserProgress, UserProgress } from '@/lib/gamificationService';
import { Zap } from 'lucide-react';

export default function XpBar() {
  const { user } = useUser();
  const [progress, setProgress] = useState<UserProgress | null>(null);

  // Fonction de chargement
  const loadProgress = async () => {
    if (!user) return;
    const data = await getUserProgress(user.id);
    setProgress(data);
  };

  useEffect(() => {
    if (user) {
      // 1. Chargement initial
      loadProgress();

      // 2. Écouter l'événement de mise à jour
      const handleUpdate = () => {
        console.log("🔄 Mise à jour XP détectée !");
        loadProgress();
      };

      window.addEventListener('xp-updated', handleUpdate);

      // 3. Nettoyage
      return () => {
        window.removeEventListener('xp-updated', handleUpdate);
      };
    }
  }, [user]);

  if (!progress) return null;

  return (
    <div className="hidden md:flex items-center gap-3 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200 mr-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col items-end">
        <span className="text-xs font-bold text-gray-900 leading-none">
          Niv. {progress.level}
        </span>
        <span className="text-[10px] text-gray-500 leading-none font-medium text-blue-600">
          {progress.xp} XP
        </span>
      </div>

      {/* Cercle de progression */}
      <div className="relative w-9 h-9 flex items-center justify-center group cursor-help">
        <svg className="w-full h-full transform -rotate-90">
          {/* Fond du cercle */}
          <circle
            cx="18"
            cy="18"
            r="15"
            stroke="currentColor"
            strokeWidth="3"
            fill="transparent"
            className="text-gray-200"
          />
          {/* Barre de progression */}
          <circle
            cx="18"
            cy="18"
            r="15"
            stroke="currentColor"
            strokeWidth="3"
            fill="transparent"
            strokeDasharray={94} // 2 * PI * 15
            strokeDashoffset={94 - (94 * progress.progress_percent) / 100}
            strokeLinecap="round"
            className="text-yellow-500 transition-all duration-1000 ease-out"
          />
        </svg>
        <Zap size={14} className="absolute text-yellow-600 fill-yellow-600 group-hover:scale-110 transition-transform" />

        {/* Tooltip simple au survol */}
        <div className="absolute top-10 right-0 bg-gray-900 text-white text-xs p-2 rounded w-32 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 text-center">
          Prochain niveau dans {progress.next_level_xp - progress.xp} XP
        </div>
      </div>
    </div>
  );
}