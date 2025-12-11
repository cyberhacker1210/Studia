import { supabase } from './supabase';

export interface Course {
  id: number;
  user_id: string;
  title: string;
  description?: string;
  extracted_text: string;
  // ✅ AJOUT DU CHAMP MANQUANT (indispensable pour l'erreur TypeScript)
  subject: string;
  created_at: string;
}

// ✅ Signature mise à jour avec subject
export async function saveCourse(userId: string, extractedText: string, title: string, subject: string = 'Général') {
  try {
    // 1. Synchronisation de l'utilisateur (Sécurité)
    await supabase.from('users').upsert({ id: userId }, { onConflict: 'id', ignoreDuplicates: true });

    // 2. Sauvegarde du cours avec la matière
    const { data, error } = await supabase
      .from('courses')
      .insert([
        {
          user_id: userId,
          title: title,
          extracted_text: extractedText,
          subject: subject, // ✅ On sauvegarde la matière
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('❌ Erreur Supabase:', error);
      throw new Error(error.message);
    }

    return data;

  } catch (err: any) {
    console.error('❌ Erreur Service:', err);
    throw new Error(err.message || 'Impossible de sauvegarder le cours');
  }
}

/**
 * Récupère tous les cours d'un utilisateur
 */
export async function getUserCourses(userId: string) {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data as Course[];
}

/**
 * Récupère un cours spécifique par son ID
 */
export async function getCourseById(courseId: number, userId: string) {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .eq('user_id', userId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Course;
}

/**
 * Met à jour un cours (titre, description)
 */
export async function updateCourse(courseId: number, userId: string, updates: Partial<Course>) {
  const { data, error } = await supabase
    .from('courses')
    .update(updates)
    .eq('id', courseId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

/**
 * Supprime un cours
 */
export async function deleteCourse(courseId: number, userId: string) {
  const { error } = await supabase
    .from('courses')
    .delete()
    .eq('id', courseId)
    .eq('user_id', userId);

  if (error) {
    throw new Error(error.message);
  }

  return true;
}