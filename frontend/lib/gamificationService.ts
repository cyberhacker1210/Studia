import { supabase } from './supabase';

const XP_PER_LEVEL_BASE = 100;

export interface UserProgress {
  xp: number;
  level: number;
  streak_days: number;
  next_level_xp: number;
  progress_percent: number;
}

export function calculateLevel(totalXp: number): number {
  if (totalXp < 0) return 1;
  return Math.floor(Math.sqrt(totalXp / XP_PER_LEVEL_BASE)) + 1;
}

export function xpForNextLevel(currentLevel: number): number {
  return Math.pow(currentLevel, 2) * XP_PER_LEVEL_BASE;
}

export async function addXp(userId: string, amount: number, action: string) {
  try {
    // 1. On récupère l'XP actuel (si l'user existe)
    const { data: user } = await supabase
      .from('users')
      .select('xp, level')
      .eq('id', userId)
      .single();

    // 2. Calcul des nouvelles valeurs
    const currentXp = user?.xp || 0;
    const newXp = currentXp + amount;
    const newLevel = calculateLevel(newXp);
    const leveledUp = newLevel > (user?.level || 1);

    // 3. Mise à jour ou Création (Upsert) pour être sûr à 100%
    const { error } = await supabase
      .from('users')
      .upsert({
        id: userId, // Clé primaire
        xp: newXp,
        level: newLevel,
        last_study_date: new Date().toISOString()
      }, { onConflict: 'id' });

    if (error) {
      console.error('❌ Erreur SQL Gamification:', error);
      return { success: false };
    }

    // 4. Notifier l'interface
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('xp-updated'));
      if (leveledUp) {
        // On peut ajouter une alerte ici plus tard
        console.log("🆙 LEVEL UP!");
      }
    }

    console.log(`🎉 XP Gained: +${amount} (${action}) | Total: ${newXp}`);
    return { success: true, newLevel, xpGained: amount };

  } catch (error) {
    console.error('❌ Erreur Gamification:', error);
    return { success: false };
  }
}

export async function getUserProgress(userId: string): Promise<UserProgress | null> {
  const { data: user } = await supabase
    .from('users')
    .select('xp, level, streak_days')
    .eq('id', userId)
    .single();

  if (!user) return {
    xp: 0, level: 1, streak_days: 0, next_level_xp: 100, progress_percent: 0
  };

  const currentLevel = user.level || 1;
  const nextLevelXp = xpForNextLevel(currentLevel);
  const currentLevelBaseXp = xpForNextLevel(currentLevel - 1);

  const xpInLevel = (user.xp || 0) - currentLevelBaseXp;
  const xpNeededForLevel = nextLevelXp - currentLevelBaseXp;

  const progress_percent = Math.min(100, Math.max(0, (xpInLevel / xpNeededForLevel) * 100));

  return {
    xp: user.xp || 0,
    level: currentLevel,
    streak_days: user.streak_days || 0,
    next_level_xp: nextLevelXp,
    progress_percent
  };
}