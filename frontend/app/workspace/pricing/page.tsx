'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Check, Crown, ShieldCheck, ArrowLeft, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PricingPage() {
  const { user } = useUser();
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

  const LEMON_LINKS = {
    monthly: "https://ton-store.lemonsqueezy.com/checkout/buy/variant_mensuel",
    yearly: "https://ton-store.lemonsqueezy.com/checkout/buy/variant_annuel"
  };

  const handleUpgrade = () => {
    if (!user) return;
    const url = LEMON_LINKS[billingCycle];
    const finalUrl = `${url}?checkout[custom][user_id]=${user.id}&checkout[email]=${user.primaryEmailAddress?.emailAddress}`;
    window.location.href = finalUrl;
  };

  const PlanFeature = ({ text }: { text: string }) => (
    <div className="flex items-start gap-3 text-slate-600">
      <div className="mt-0.5 bg-green-100 text-green-600 rounded-full p-0.5"><Check size={14} strokeWidth={4} /></div>
      <span className="text-sm sm:text-base">{text}</span>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto pb-24 px-4 pt-6 sm:pt-10">
      <button onClick={() => router.back()} className="mb-6 sm:mb-8 flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold text-xs sm:text-sm transition-colors">
        <ArrowLeft size={16} /> Retour
      </button>

      <div className="text-center mb-8 sm:mb-16">
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 mb-3 sm:mb-4 leading-tight">Passez à la vitesse supérieure.</h1>
        <p className="text-base sm:text-xl text-slate-500 font-medium">Investissez en vous-même.</p>
      </div>

      {/* Toggle */}
      <div className="flex justify-center mb-8 sm:mb-12">
        <div className="bg-slate-100 p-1 rounded-xl flex items-center relative w-full sm:w-auto">
           <button onClick={() => setBillingCycle('monthly')} className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${billingCycle === 'monthly' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>Mensuel</button>
           <button onClick={() => setBillingCycle('yearly')} className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${billingCycle === 'yearly' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>
             Annuel <span className="bg-green-100 text-green-700 text-[10px] px-1.5 py-0.5 rounded-full uppercase hidden sm:inline">-20%</span>
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 max-w-4xl mx-auto items-center">
        {/* Free */}
        <div className="bg-white border-2 border-slate-100 rounded-[2rem] p-6 sm:p-8 hover:border-slate-200 transition-colors order-2 md:order-1">
           <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">Gratuit</h3>
           <div className="text-3xl sm:text-4xl font-black text-slate-900 mb-6">0€</div>
           <button disabled className="w-full py-3 sm:py-4 rounded-2xl font-bold text-slate-400 bg-slate-100 mb-8 text-sm sm:text-base">Votre plan actuel</button>
           <div className="space-y-4">
              <PlanFeature text="5 éclairs d'énergie / jour" />
              <PlanFeature text="Quiz basiques" />
              <PlanFeature text="Flashcards limitées" />
           </div>
        </div>

        {/* Premium */}
        <div className="bg-slate-900 text-white rounded-[2rem] p-8 sm:p-10 relative overflow-hidden shadow-2xl shadow-slate-200 order-1 md:order-2 transform md:scale-105">
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
           <div className="absolute top-6 right-6 bg-yellow-400 text-slate-900 text-[10px] sm:text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest">Populaire</div>

           <h3 className="text-xl sm:text-2xl font-black mb-2 relative z-10 flex items-center gap-2">
               <Crown size={24} className="fill-yellow-400 text-yellow-400"/> Premium
           </h3>
           <div className="text-4xl sm:text-5xl font-black mb-6 relative z-10">
              {billingCycle === 'yearly' ? '7.99€' : '9.99€'} <span className="text-base sm:text-lg text-slate-400 font-medium">/mois</span>
           </div>

           <button
             onClick={handleUpgrade}
             className="w-full py-3 sm:py-4 rounded-2xl font-bold text-slate-900 bg-white hover:bg-blue-50 transition-colors mb-8 shadow-lg relative z-10 flex items-center justify-center gap-2 active:scale-95 text-sm sm:text-base"
           >
             <Zap fill="currentColor" className="text-yellow-500"/> Débloquer tout
           </button>

           <div className="space-y-4 relative z-10 text-sm">
              <div className="flex gap-3"><Check className="text-green-400"/> <span>Énergie <strong>ILLIMITÉE</strong> ⚡️</span></div>
              <div className="flex gap-3"><Check className="text-green-400"/> <span>Tuteur IA Socratique</span></div>
              <div className="flex gap-3"><Check className="text-green-400"/> <span>Mode Parcours</span></div>
           </div>
        </div>
      </div>

      <div className="text-center mt-12 sm:mt-16 flex flex-col items-center gap-2 sm:gap-4 text-slate-400 text-xs font-medium">
         <div className="flex items-center gap-2"><ShieldCheck size={16} /> Paiement sécurisé</div>
      </div>
    </div>
  );
}