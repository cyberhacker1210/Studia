'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';

export function useEnergy() {
  const { user, isLoaded } = useUser();
  const [energy, setEnergy] = useState(4); // Valeur par défaut optimiste
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  const refreshEnergy = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('users')
        .select('energy, is_premium, last_energy_refill')
        .eq('id', user.id)
        .single();

      if (data) {
        setIsPremium(data.is_premium || false);

        if (data.is_premium) {
            setEnergy(999);
        } else {
            // Vérification du reset quotidien
            const lastDate = data.last_energy_refill ? new Date(data.last_energy_refill).toDateString() : null;
            const today = new Date().toDateString();

            if (lastDate !== today) {
                // Nouveau jour : Reset à 4
                await supabase.from('users').update({
                    energy: 4,
                    last_energy_refill: new Date().toISOString()
                }).eq('id', user.id);
                setEnergy(4);
            } else {
                // Même jour : On garde la valeur actuelle (qui peut être 9 si parrainage)
                setEnergy(data.energy ?? 4);
            }
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Écouteur temps réel (Realtime)
  useEffect(() => {
      if (!user) return;
      refreshEnergy();

      // Si un parrainage ajoute de l'énergie, on met à jour l'UI direct
      const subscription = supabase
        .channel('energy-updates')
        .on(
            'postgres_changes',
            { event: 'UPDATE', schema: 'public', table: 'users', filter: `id=eq.${user.id}` },
            (payload) => {
                if (payload.new.energy !== undefined) {
                    console.log("⚡️ Énergie mise à jour :", payload.new.energy);
                    setEnergy(payload.new.energy);
                }
            }
        )
        .subscribe();

      return () => { supabase.removeChannel(subscription); };
  }, [user]);

  const consumeEnergy = async (amount: number): Promise<boolean> => {
    if (isPremium) return true;
    if (energy < amount) return false;

    const newAmount = energy - amount;
    setEnergy(newAmount); // Mise à jour immédiate
    if (user) await supabase.from('users').update({ energy: newAmount }).eq('id', user.id);
    return true;
  };

  // Fonction de remboursement (si erreur backend)
  const refundEnergy = async (amount: number) => {
      if (isPremium || !user) return;
      const newAmount = energy + amount;
      setEnergy(newAmount);
      await supabase.from('users').update({ energy: newAmount }).eq('id', user.id);
  };

  return { energy, isPremium, loading, consumeEnergy, refreshEnergy, refundEnergy };
}