'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';

export function useEnergy() {
  const { user, isLoaded } = useUser();
  // On part de 4 (ou 5) pour l'affichage initial optimiste
  const [energy, setEnergy] = useState(4);
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fonction pour recharger les données réelles
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
            setEnergy(999); // Infini
        } else {
            // Vérification du reset quotidien
            const lastDate = new Date(data.last_energy_refill).toDateString();
            const today = new Date().toDateString();

            if (lastDate !== today) {
                await supabase.from('users').update({
                    energy: 4,
                    last_energy_refill: new Date().toISOString()
                }).eq('id', user.id);
                setEnergy(4);
            } else {
                setEnergy(data.energy ?? 4);
            }
        }
      }
    } catch (e) {
      console.error("Erreur Energy:", e);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour consommer de l'énergie (utilisée par les boutons)
  const consumeEnergy = async (amount: number): Promise<boolean> => {
    if (isPremium) return true; // Gratuit pour les premiums
    if (energy < amount) return false; // Pas assez d'énergie

    const newAmount = energy - amount;
    setEnergy(newAmount); // Mise à jour visuelle immédiate (Optimistic UI)

    if (user) {
        await supabase.from('users').update({ energy: newAmount }).eq('id', user.id);

        // 🔥 SIGNAL GLOBAL : Dire à toute l'app (Sidebar, etc.) de se mettre à jour
        window.dispatchEvent(new Event('energy-updated'));
    }
    return true;
  };

  // Fonction de remboursement (en cas d'erreur API)
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
        // 1. Chargement initial
        refreshEnergy();

        // 2. Écouteur local (quand un autre composant déclenche consumeEnergy)
        const handleLocalUpdate = () => refreshEnergy();
        window.addEventListener('energy-updated', handleLocalUpdate);

        // 3. Écouteur Temps Réel (si Supabase change à distance)
        const subscription = supabase
          .channel('realtime-energy')
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'users',
              filter: `id=eq.${user.id}`
            },
            (payload) => {
              const newEnergy = payload.new.energy;
              if (typeof newEnergy === 'number') {
                setEnergy(newEnergy);
              }
            }
          )
          .subscribe();

        return () => {
            window.removeEventListener('energy-updated', handleLocalUpdate);
            supabase.removeChannel(subscription);
        };
    }
  }, [isLoaded, user]);

  return { energy, isPremium, loading, consumeEnergy, refreshEnergy, refundEnergy };
}