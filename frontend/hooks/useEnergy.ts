'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';

export function useEnergy() {
  const { user, isLoaded } = useUser();
  // Par défaut à 4 pour l'UI immédiate
  const [energy, setEnergy] = useState(4);
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fonction pour recharger depuis la DB
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
            // Vérification du reset quotidien (minuit)
            const lastDate = new Date(data.last_energy_refill).toDateString();
            const today = new Date().toDateString();

            if (lastDate !== today) {
                // C'est un nouveau jour ! Reset à 4.
                await supabase.from('users').update({
                    energy: 4,
                    last_energy_refill: new Date().toISOString()
                }).eq('id', user.id);
                setEnergy(4);
            } else {
                // Sinon on prend la valeur réelle
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

  // Fonction pour consommer de l'énergie
  const consumeEnergy = async (amount: number): Promise<boolean> => {
    if (isPremium) return true; // Gratuit pour les premiums
    if (energy < amount) return false; // Pas assez

    const newAmount = energy - amount;
    setEnergy(newAmount); // Mise à jour visuelle immédiate (optimiste)

    if (user) {
        await supabase.from('users').update({ energy: newAmount }).eq('id', user.id);
        // Signal pour les autres composants (Sidebar)
        window.dispatchEvent(new Event('energy-updated'));
    }
    return true;
  };

  useEffect(() => {
    if (isLoaded && user) {
        // 1. Chargement initial
        refreshEnergy();

        // 2. Écouteur local (quand je clique sur un bouton)
        const handleLocalUpdate = () => refreshEnergy();
        window.addEventListener('energy-updated', handleLocalUpdate);

        // 3. Écouteur Temps Réel (quand un ami s'inscrit sur un autre ordi)
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
              console.log("⚡️ Update realtime !", payload);
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

  return { energy, isPremium, loading, consumeEnergy, refreshEnergy };
}