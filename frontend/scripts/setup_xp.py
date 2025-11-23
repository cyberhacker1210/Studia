import os

# 1. LE CODE DU SERVICE GAMIFICATION
GAMIFICATION_SERVICE_CODE = """import { supabase } from './supabase';

const XP_PER_LEVEL_BASE = 100;

export interface UserProgress {
  xp: number;
  level: number;
  streak_days: number;
  next_level_xp: number;
  progress_percent: number;
}

export function calculateLevel(totalXp: number): number {
  return Math.floor(Math.sqrt(totalXp / XP_PER_LEVEL_BASE)) + 1;
}

export function xpForNextLevel(currentLevel: number): number {
  return Math.pow(currentLevel, 2) * XP_PER_LEVEL_BASE;
}

export async function addXp(userId: string, amount: number, action: string) {
  try {
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('xp, level')
      .eq('id', userId)
      .single();

    if (fetchError || !user) return;

    const newXp = (user.xp || 0) + amount;
    const newLevel = calculateLevel(newXp);

    await supabase
      .from('users')
      .update({ 
        xp: newXp,
        level: newLevel,
        last_study_date: new Date().toISOString()
      })
      .eq('id', userId);

    console.log(`🎉 XP Gained: +${amount} (${action})`);
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

  if (!user) return null;

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
"""

# 2. LE CODE DU COMPOSANT XP BAR
XP_BAR_CODE = """'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { getUserProgress, UserProgress } from '@/lib/gamificationService';
import { Zap } from 'lucide-react';

export default function XpBar() {
  const { user } = useUser();
  const [progress, setProgress] = useState<UserProgress | null>(null);

  useEffect(() => {
    if (user) {
      loadProgress();
      // Rafraîchir toutes les 30s au cas où
      const interval = setInterval(loadProgress, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadProgress = async () => {
    if (!user) return;
    const data = await getUserProgress(user.id);
    setProgress(data);
  };

  if (!progress) return null;

  return (
    <div className="hidden md:flex items-center gap-3 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200 mr-4">
      <div className="flex flex-col items-end">
        <span className="text-xs font-bold text-gray-900 leading-none">
          Niv. {progress.level}
        </span>
        <span className="text-[10px] text-gray-500 leading-none">
          {progress.xp} XP
        </span>
      </div>

      <div className="relative w-8 h-8 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="3" fill="transparent" className="text-gray-200" />
          <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="3" fill="transparent"
            strokeDasharray={88}
            strokeDashoffset={88 - (88 * progress.progress_percent) / 100}
            className="text-yellow-500 transition-all duration-1000 ease-out"
          />
        </svg>
        <Zap size={12} className="absolute text-yellow-600 fill-yellow-600" />
      </div>
    </div>
  );
}
"""


def create_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"✅ Fichier créé : {path}")


def patch_file(path, import_line, target_string, insert_code):
    if not os.path.exists(path):
        print(f"❌ Fichier introuvable : {path}")
        return

    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Ajouter l'import si pas présent
    if import_line not in content:
        # On cherche la fin des imports pour insérer proprement
        if "import" in content:
            last_import_index = content.rfind("import")
            end_of_line = content.find("\n", last_import_index) + 1
            content = content[:end_of_line] + import_line + "\n" + content[end_of_line:]
            print(f"🔹 Import ajouté dans {path}")
        else:
            content = import_line + "\n" + content

    # 2. Insérer la logique
    if insert_code.strip() not in content:
        if target_string in content:
            content = content.replace(target_string, target_string + "\n" + insert_code)
            print(f"🔹 Logique injectée dans {path}")

            with open(path, 'w', encoding='utf-8') as f:
                f.write(content)
        else:
            print(f"⚠️ Impossible de trouver l'endroit où insérer le code dans {path}")
            print(f"   Cherché : '{target_string}'")
    else:
        print(f"ℹ️ Code déjà présent dans {path}")


# --- EXECUTION ---

print("🚀 Démarrage de l'installation de la Gamification...")

# 1. Création des fichiers
create_file('lib/gamificationService.ts', GAMIFICATION_SERVICE_CODE)
create_file('components/workspace/XpBar.tsx', XP_BAR_CODE)

# 2. Modification de CapturePage (Récompense création cours)
patch_file(
    'app/workspace/capture/page.tsx',
    "import { addXp } from '@/lib/gamificationService';",
    "setSuccess(true);",
    """      
      // 🎉 GAMIFICATION
      await addXp(user.id, 50, 'Nouveau cours créé');
    """
)

# 3. Modification de Navbar (Affichage barre XP)
# On essaie de le mettre avant le UserButton
# Note: On ajuste le chemin d'import selon la structure du projet
patch_file(
    'components/workspace/WorkspaceNavbar.tsx',
    "import XpBar from './XpBar';",
    "<div className=\"ml-2\">",
    "          <XpBar />"
)

print("\n✅ Installation terminée !")
print("👉 N'oublie pas de redémarrer ton serveur : npm run dev")