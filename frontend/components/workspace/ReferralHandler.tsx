'use client';

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';

export default function ReferralHandler() {
  const { user } = useUser();

  useEffect(() => {
    const handleReferral = async () => {
      if (!user) return;

      const referrerId = localStorage.getItem('studia_referrer_id');

      // Anti-triche : pas de auto-parrainage
      if (!referrerId || referrerId === user.id) return;

      try {
        // Vérifier si déjà parrainé
        const { data: currentUser } = await supabase
          .from('users')
          .select('referred_by')
          .eq('id', user.id)
          .single();

        if (currentUser?.referred_by) {
          localStorage.removeItem('studia_referrer_id');
          return;
        }

        console.log("🔄 Validation du parrainage pour :", referrerId);

        // Marquer comme parrainé
        await supabase
          .from('users')
          .update({ referred_by: referrerId })
          .eq('id', user.id);

        // Récupérer l'énergie du parrain
        const { data: referrer } = await supabase
          .from('users')
          .select('energy')
          .eq('id', referrerId)
          .single();

        // Donner +5 éclairs au parrain
        if (referrer) {
            const newEnergy = (referrer.energy || 0) + 5;
            await supabase
              .from('users')
              .update({ energy: newEnergy })
              .eq('id', referrerId);

            console.log("✅ Parrainage validé ! +5 éclairs distribués.");
        }

        localStorage.removeItem('studia_referrer_id');

      } catch (error) {
        console.error("Erreur parrainage:", error);
      }
    };

    handleReferral();
  }, [user]);

  return null;
}