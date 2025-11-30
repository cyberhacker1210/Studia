import { supabase } from './supabase';

export interface SubscriptionStatus {
  isPremium: boolean;
  plan: 'free' | 'monthly' | 'yearly';
  expiresAt: string | null;
}

/**
 * Vérifie le statut de l'utilisateur
 */
export async function checkSubscription(userId: string): Promise<SubscriptionStatus> {
  const { data, error } = await supabase
    .from('users')
    .select('is_premium, plan_type, premium_until')
    .eq('id', userId)
    .single();

  if (error || !data) {
    return { isPremium: false, plan: 'free', expiresAt: null };
  }

  return {
    isPremium: data.is_premium || false,
    plan: (data.plan_type as any) || 'free',
    expiresAt: data.premium_until
  };
}

/**
 * Active le premium (Simule un retour Stripe réussi)
 */
export async function activatePremium(userId: string, plan: 'monthly' | 'yearly') {
  // Calcul de la date d'expiration
  const date = new Date();
  if (plan === 'monthly') date.setMonth(date.getMonth() + 1);
  else date.setFullYear(date.getFullYear() + 1);

  const { error } = await supabase
    .from('users')
    .update({
      is_premium: true,
      plan_type: plan,
      premium_until: date.toISOString()
    })
    .eq('id', userId);

  if (error) throw error;
  return true;
}