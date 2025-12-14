'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Check, Crown, ShieldCheck, ArrowLeft, Star, Rocket } from 'lucide-react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import ReferralWidget from '@/components/workspace/ReferralWidget'; // ✅ Import
import { useEnergy } from '@/hooks/useEnergy';

export default function PricingPage() {
  const { user } = useUser();
  const router = useRouter();
  const { isPremium } = useEnergy();
  const [interested, setInterested] = useState(false);

  const handleInterest = async () => {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    setInterested(true);

    if (user && navigator.sendBeacon) {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const data = JSON.stringify({
            user_id: user.id,
            event_type: 'premium_interest',
            event_data: { email: user.primaryEmailAddress?.emailAddress }
        });
        navigator.sendBeacon(`${API_URL}/api/analytics/track`, data);
    }
  };

  const PlanFeature = ({ text, highlight = false }: { text: string, highlight?: boolean }) => (
    <div className="flex items-start gap-3">
      <div className={`mt-0.5 rounded-full p-0.5 ${highlight ? 'bg-yellow-400 text-slate-900' : 'bg-green-100 text-green-600'}`}>
          <Check size={14} strokeWidth={4} />
      </div>
      <span className={`text-sm sm:text-base font-medium ${highlight ? 'text-white' : 'text-slate-600'}`}>{text}</span>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto pb-24 px-6 pt-10">
      <button onClick={() => router.back()} className="mb-8 flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold text-sm transition-colors">
        <ArrowLeft size={18} /> Retour
      </button>

      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-4 border border-blue-100">
            <Rocket size={14} /> Bêta Publique
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 leading-tight">
            Le futur de Studia.
        </h1>
        <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto">
            Nous construisons la version Premium. Profitez des fonctionnalités de base gratuitement.
        </p>
      </div>

      {/* ✅ WIDGET PARRAINAGE (Alternative au paiement) */}
      {!isPremium && (
          <div className="max-w-3xl mx-auto mb-16 animate-in slide-in-from-bottom-4">
              <ReferralWidget />
          </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">

        {/* GRATUIT */}
        <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-8 hover:border-slate-200 transition-colors relative">
           <h3 className="text-2xl font-black text-slate-900 mb-2">Studia Bêta</h3>
           <div className="text-4xl font-black text-slate-900 mb-6">Gratuit</div>
           <p className="text-slate-500 font-medium mb-8 text-sm">
               Pour découvrir la méthode 20/20.
           </p>
           <div className="space-y-4 mb-8">
              <PlanFeature text="5 éclairs d'énergie par jour" />
              <PlanFeature text="Scanner de cours" />
              <PlanFeature text="Quiz & Flashcards" />
              <PlanFeature text="Mode Parcours Adaptatif" />
           </div>
           <button disabled className="w-full py-4 rounded-2xl font-bold text-slate-400 bg-slate-100 text-sm">
               Votre plan actuel
           </button>
        </div>

        {/* PREMIUM */}
        <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 relative overflow-hidden shadow-2xl shadow-slate-200 transform md:scale-105 border border-slate-800">
           <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full blur-[80px] opacity-20 -mr-16 -mt-16"></div>
           <div className="flex justify-between items-start mb-2 relative z-10">
               <h3 className="text-2xl font-black flex items-center gap-2">
                   <Crown size={24} className="fill-yellow-400 text-yellow-400"/> Premium
               </h3>
               <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-white/10">Bientôt</span>
           </div>
           <div className="text-4xl font-black mb-6 relative z-10 text-slate-200">
              ? € <span className="text-lg font-medium text-slate-500">/mois</span>
           </div>
           <p className="text-slate-400 font-medium mb-8 text-sm relative z-10">
               L'expérience ultime sans limite.
           </p>
           <div className="space-y-4 mb-8 relative z-10">
              <PlanFeature text="Énergie ILLIMITÉE ⚡️" highlight />
              <PlanFeature text="Modèle IA Supérieur (GPT-4o)" highlight />
              <PlanFeature text="Mode Oral (Voix HD)" highlight />
              <PlanFeature text="Correction devoirs manuscrits" highlight />
           </div>
           {!interested ? (
               <button onClick={handleInterest} className="w-full py-4 rounded-2xl font-bold text-slate-900 bg-white hover:bg-blue-50 transition-all shadow-lg relative z-10 flex items-center justify-center gap-2 active:scale-95">
                 <Star size={18} className="fill-yellow-400 text-yellow-400"/> Ça m'intéresse
               </button>
           ) : (
               <button disabled className="w-full py-4 rounded-2xl font-bold text-green-400 bg-green-900/30 border border-green-500/30 relative z-10 flex items-center justify-center gap-2">
                 <Check size={18} /> C'est noté !
               </button>
           )}
        </div>
      </div>

      <div className="text-center mt-16 flex flex-col items-center gap-4 text-slate-400 text-xs font-medium">
         <div className="flex items-center gap-2"><ShieldCheck size={16} /> Pas de spam, promis.</div>
      </div>
    </div>
  );
}