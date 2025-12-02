'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';

export function useEnergy() {
  const { user, isLoaded } = useUser();
  const [energy, setEnergy] = useState(5);
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  const refreshEnergy = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('users')
        .select('energy, is_premium, last_energy_refill')
        .eq('id', user.id)
        .single();

      if (data) {
        setIsPremium(data.is_premium || false);

        if (data.is_premium) {
            setEnergy(999);
        } else {
            const lastDate = new Date(data.last_energy_refill).toDateString();
            const today = new Date().toDateString();

            if (lastDate !== today) {
                await supabase.from('users').update({
                    energy: 5,
                    last_energy_refill: new Date().toISOString()
                }).eq('id', user.id);
                setEnergy(5);
            } else {
                setEnergy(data.energy ?? 5);
            }
        }
      }
    } catch (e) {
      console.error("Erreur Energy:", e);
    } finally {
      setLoading(false);
    }
  };

  const consumeEnergy = async (amount: number): Promise<boolean> => {
    if (isPremium) return true;
    if (energy < amount) return false;

    const newAmount = energy - amount;
    setEnergy(newAmount);

    if (user) {
        await supabase.from('users').update({ energy: newAmount }).eq('id', user.id);
        window.dispatchEvent(new Event('energy-updated'));
    }
    return true;
  };

  // 👇 NOUVEAU : Fonction de remboursement
  const refundEnergy = async (amount: number) => {
    if (isPremium) return;
    const newAmount = energy + amount;
    setEnergy(newAmount);

    if (user) {
        await supabase.from('users').update({ energy: newAmount }).eq('id', user.id);
        window.dispatchEvent(new Event('energy-updated'));
        console.log(`⚡️ Remboursement de ${amount} éclairs effectué.`);
    }
  };

  useEffect(() => {
    if (isLoaded && user) {
        refreshEnergy();
        const handleLocalUpdate = () => refreshEnergy();
        window.addEventListener('energy-updated', handleLocalUpdate);

        const subscription = supabase
          .channel('realtime-energy')
          .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'users', filter: `id=eq.${user.id}` },
          (payload) => {
              const newEnergy = payload.new.energy;
              if (typeof newEnergy === 'number') setEnergy(newEnergy);
          })
          .subscribe();

        return () => {
            window.removeEventListener('energy-updated', handleLocalUpdate);
            supabase.removeChannel(subscription);
        };
    }
  }, [isLoaded, user]);

  return { energy, isPremium, loading, consumeEnergy, refreshEnergy, refundEnergy };
}