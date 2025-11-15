import { supabase } from './supabase';

export interface Course {
  id: number;
  user_id: string;
  title: string;
  description: string | null;
  extracted_text: string;
  created_at: string;
}

/**
 * Sauvegarder un cours (texte extrait)
 */
export async function saveCourse(
  userId: string,
  extractedText: string,
  title?: string
): Promise<Course> {
  try {
    const { data, error } = await supabase
      .from('courses')
      .insert({
        user_id: userId,
        title: title || `Cours du ${new Date().toLocaleDateString('fr-FR')}`,
        description: null,
        extracted_text: extractedText,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Erreur sauvegarde cours:', error);
    throw error;
  }
}

/**
 * Récupérer tous les cours d'un utilisateur
 */
export async function getUserCourses(userId: string): Promise<Course[]> {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data || [];
}

/**
 * Récupérer un cours par ID
 */
export async function getCourseById(
  courseId: number,
  userId: string
): Promise<Course | null> {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Erreur récupération cours:', error);
    return null;
  }

  return data;
}

/**
 * Supprimer un cours
 */
export async function deleteCourse(
  courseId: number,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from('courses')
    .delete()
    .eq('id', courseId)
    .eq('user_id', userId);

  if (error) throw error;
}

/**
 * Mettre à jour le titre/description
 */
export async function updateCourse(
  courseId: number,
  userId: string,
  updates: { title?: string; description?: string }
): Promise<void> {
  const { error } = await supabase
    .from('courses')
    .update(updates)
    .eq('id', courseId)
    .eq('user_id', userId);

  if (error) throw error;
}