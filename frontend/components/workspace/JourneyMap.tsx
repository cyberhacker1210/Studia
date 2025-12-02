'use client';

import { Lock, Check, Play, Star } from 'lucide-react';

interface Module {
  title: string;
  status: 'locked' | 'current' | 'completed';
}

interface JourneyMapProps {
  modules: Module[];
  onModuleClick: (index: number) => void;
}

export default function JourneyMap({ modules, onModuleClick }: JourneyMapProps) {
  return (
    <div className="relative max-w-md mx-auto py-16">

      {/* Ligne centrale (Arrière-plan) */}
      {/* Pointillés gris pour le futur, Ligne pleine pour le passé */}
      <div className="absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2 z-0 bg-slate-100 rounded-full"></div>

      <div className="space-y-24 relative z-10"> {/* Espace vertical augmenté */}
        {modules.map((mod, idx) => {
          const isLeft = idx % 2 === 0;
          const isLocked = mod.status === 'locked';
          const isCurrent = mod.status === 'current';
          const isCompleted = mod.status === 'completed';

          let icon = <Lock size={20} className="text-slate-300" />;
          let style = "bg-white border-4 border-slate-100 shadow-sm scale-90 grayscale opacity-60"; // Grisâtre si locked

          if (isCurrent) {
              icon = <Play size={24} fill="currentColor" className="text-white ml-1" />;
              style = "bg-slate-900 border-4 border-blue-200 text-white scale-125 shadow-2xl ring-4 ring-white z-20"; // Coloré et gros si current
          } else if (isCompleted) {
              icon = <Check size={24} strokeWidth={3} className="text-white" />;
              style = "bg-green-500 border-4 border-green-200 text-white shadow-lg scale-100"; // Vert si fini
          }

          return (
            <div key={idx} className={`flex items-center ${isLeft ? 'justify-end md:pr-32' : 'justify-start md:pl-32'} relative group`}>

                {/* Le Cercle d'étape */}
                <button
                    onClick={() => !isLocked && onModuleClick(idx)}
                    disabled={isLocked}
                    className={`absolute left-1/2 -translate-x-1/2 w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 ${style} ${!isLocked ? 'cursor-pointer hover:scale-110' : 'cursor-not-allowed'}`}
                >
                    {icon}
                </button>

                {/* L'étiquette */}
                <div className={`
                    hidden md:block absolute ${isLeft ? 'right-[60%]' : 'left-[60%]'} w-48 p-4 bg-white rounded-2xl border-2 shadow-sm transition-all duration-300
                    ${isLocked ? 'border-slate-100 text-slate-300' : 'border-slate-100 text-slate-900 hover:shadow-md hover:-translate-y-1'}
                    ${isCurrent ? 'border-blue-500 ring-2 ring-blue-100' : ''}
                `}>
                    <div className="text-xs font-black uppercase tracking-wider mb-1 opacity-60">
                        Module {idx + 1}
                    </div>
                    <div className="font-bold text-sm leading-tight">
                        {mod.title}
                    </div>
                </div>
            </div>
          );
        })}

        {/* Le Coffre Final */}
        <div className="flex justify-center pt-12 relative">
            <div className="w-24 h-24 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-[2rem] flex items-center justify-center border-4 border-white shadow-2xl z-10 relative group cursor-pointer hover:scale-110 transition-transform">
                <div className="absolute -inset-4 bg-yellow-400/20 rounded-full blur-xl animate-pulse"></div>
                <Star size={48} className="text-yellow-500 fill-yellow-500 drop-shadow-md" />
            </div>
            {/* Ligne finale pointillée */}
            <div className="absolute top-0 left-1/2 h-12 w-1 bg-slate-100 -translate-x-1/2 border-l-2 border-dashed border-slate-300"></div>
        </div>
      </div>
    </div>
  );
}