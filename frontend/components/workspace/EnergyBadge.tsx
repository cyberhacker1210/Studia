'use client';

import { useEnergy } from '@/hooks/useEnergy';
import { Zap, Infinity as InfinityIcon } from 'lucide-react';
import Link from 'next/link';

export default function EnergyBadge() {
  // On récupère l'énergie via le hook
  const { energy, isPremium, loading } = useEnergy();

  if (loading) return <div className="w-16 h-8 bg-slate-100 rounded-full animate-pulse"></div>;

  return (
    <Link href="/workspace/pricing" className="group relative inline-block">
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border-2 transition-all cursor-pointer ${
        isPremium 
          ? 'bg-slate-900 border-slate-900 text-yellow-400' 
          : energy === 0 
            ? 'bg-red-50 border-red-200 text-red-500 hover:bg-red-100'
            : 'bg-white border-slate-200 text-slate-900 hover:border-yellow-400'
      }`}>
        {/* L'icône Éclair */}
        <Zap
          size={16}
          className={`${isPremium || energy > 0 ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'} group-hover:scale-110 transition-transform`}
        />

        {/* Le chiffre (ou infini) */}
        <span className="font-black text-sm font-mono leading-none">
          {isPremium ? <InfinityIcon size={16} /> : energy}
        </span>
      </div>

      {/* Tooltip au survol */}
      <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-max bg-slate-900 text-white text-[10px] py-1 px-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none font-bold z-50 shadow-lg">
        {isPremium ? 'Énergie illimitée' : 'Énergie quotidienne'}
      </div>
    </Link>
  );
}