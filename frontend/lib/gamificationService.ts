import { supabase } from './supabase';

const XP_PER_LEVEL_BASE = 100;

export interface UserProgress {
  xp: number;
  level: number;
  streak_days: number;
  next_level_xp: number;
  progress_percent: number;
  last_study_date: string;
  weekly_activity: boolean[]; // [Lun, Mar, Mer, Jeu, Ven, Sam, Dim]
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
    const { data: user } = await supabase
      .from('users')
      .select('xp, level, streak_days, last_study_date')
      .eq('id', userId)
      .single();

    if (!user) return { success: false };

    let newStreak = user.streak_days || 0;
    const today = new Date().toDateString();
    const lastDate = user.last_study_date ? new Date(user.last_study_date).toDateString() : null;

    // Gestion de la Série (Streak)
    if (lastDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        if (lastDate === yesterday.toDateString()) {
            newStreak += 1; // Continuité
        } else {
            newStreak = 1; // Rupture ou début
        }
    }

    const currentXp = user.xp || 0;
    const newXp = currentXp + amount;
    const newLevel = calculateLevel(newXp);
    const leveledUp = newLevel > (user.level || 1);

    await supabase
      .from('users')
      .update({
        id: userId,
        xp: newXp,
        level: newLevel,
        streak_days: newStreak,
        last_study_date: new Date().toISOString()
      })
      .eq('id', userId);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('xp-updated'));
      if (leveledUp) console.log("🆙 LEVEL UP!", newLevel);
    }

    return { success: true, newLevel, xpGained: amount, newStreak };

  } catch (error) {
    console.error('❌ Erreur Gamification:', error);
    return { success: false };
  }
}

export async function getUserProgress(userId: string): Promise<UserProgress | null> {
  const { data: user } = await supabase
    .from('users')
    .select('xp, level, streak_days, last_study_date')
    .eq('id', userId)
    .single();

  if (!user) return null;

  const currentLevel = user.level || 1;
  const nextLevelXp = xpForNextLevel(currentLevel);
  const currentLevelBaseXp = xpForNextLevel(currentLevel - 1);
  const xpInLevel = (user.xp || 0) - currentLevelBaseXp;
  const xpNeededForLevel = nextLevelXp - currentLevelBaseXp;
  const progress_percent = Math.min(100, Math.max(0, (xpInLevel / xpNeededForLevel) * 100));

  // Simulation semaine (pour l'instant, on met tout à false sauf aujourd'hui si actif)
  // V2 : Il faudrait une table 'activity_logs' pour avoir l'historique précis
  const weekly_activity =Array(7).fill(false);
  const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1; // Lun=0

  if (user.last_study_date && new Date(user.last_study_date).toDateString() === new Date().toDateString()) {
      weekly_activity[todayIndex] = true;
  }

  return {
    xp: user.xp || 0,
    level: currentLevel,
    streak_days: user.streak_days || 0,
    next_level_xp: nextLevelXp,
    progress_percent,
    last_study_date: user.last_study_date,
    weekly_activity
  };
}