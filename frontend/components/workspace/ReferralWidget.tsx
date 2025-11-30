'use client';

import { useState, useEffect } from 'react';
import { Gift, Copy, Check, Users } from 'lucide-react';
import { useUser } from '@clerk/nextjs';

export default function ReferralWidget() {
  const { user } = useUser();
  const [copied, setCopied] = useState(false);
  const [referralLink, setReferralLink] = useState('');

  // On attend que le client soit monté pour avoir window.location
  useEffect(() => {
    if (user) {
      setReferralLink(`${window.location.origin}/?ref=${user.id}`);
    }
  }, [user]);

  const handleShare = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(`Rejoins-moi sur Studia et hack tes révisions ! 🚀 ${referralLink}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 mb-10">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-12 -mt-12 blur-3xl"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner border border-white/20">
                    <Users size={32} className="text-yellow-300 animate-pulse" />
                </div>
                <div>
                    <h3 className="text-xl font-extrabold mb-1">Plus d'énergie ? ⚡️</h3>
                    <p className="text-indigo-200 font-medium text-sm max-w-xs leading-relaxed">
                        Invite un ami. Quand il s'inscrit, tu reçois immédiatement <strong className="text-yellow-300 text-lg">+5 Éclairs</strong> !
                    </p>
                </div>
            </div>

            <button
                onClick={handleShare}
                className="bg-white text-indigo-900 px-6 py-3 rounded-xl font-bold shadow-lg active:scale-95 transition-all flex items-center gap-2 min-w-[180px] justify-center hover:bg-indigo-50"
            >
                {copied ? (
                    <><Check size={18} className="text-green-600"/> Lien copié !</>
                ) : (
                    <><Copy size={18}/> Inviter un ami</>
                )}
            </button>
        </div>
    </div>
  );
}