import { supabase } from './supabase';

export interface Course {
  id: number;
  user_id: string;
  title: string;
  description?: string;
  extracted_text: string;
  created_at: string;
}

/**
 * Sauvegarde un nouveau cours dans Supabase
 * S'assure d'abord que l'utilisateur existe dans la table 'users'
 */
export async function saveCourse(userId: string, extractedText: string, title: string) {
  try {
    // 1. Synchronisation de l'utilisateur (Création s'il n'existe pas)
    // C'est crucial pour éviter l'erreur "foreign key constraint"
    const { error: userError } = await supabase
      .from('users')
      .upsert(
        {
          id: userId,
          // On peut ajouter d'autres champs par défaut ici si besoin
          // xp: 0, level: 1... (mais Supabase a déjà des defaults)
        },
        { onConflict: 'id', ignoreDuplicates: true }
      );

    if (userError) {
      console.warn("⚠️ Warning: Impossible de synchroniser l'utilisateur", userError.message);
      // On ne bloque pas le processus, on tente quand même de sauvegarder le cours
    }

    // 2. Sauvegarde du cours
    const { data, error } = await supabase
      .from('courses')
      .insert([
        {
          user_id: userId,
          title: title,
          extracted_text: extractedText,
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('❌ Erreur Supabase (insert course):', error);
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