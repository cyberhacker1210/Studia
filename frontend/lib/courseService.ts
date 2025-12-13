import { supabase } from './supabase';

export interface Course {
  id: number;
  user_id: string;
  title: string;
  description?: string;
  extracted_text: string;
  subject: string;
  created_at: string;
}

export async function saveCourse(userId: string, extractedText: string, title: string, subject: string = 'Général') {
  try {
    await supabase.from('users').upsert({ id: userId }, { onConflict: 'id', ignoreDuplicates: true });

    const { data, error } = await supabase
      .from('courses')
      .insert([
        {
          user_id: userId,
          title: title,
          extracted_text: extractedText,
          subject: subject,
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;

  } catch (err: any) {
    console.error('❌ Erreur Service:', err);
    throw new Error(err.message);
  }
}

export async function getUserCourses(userId: string) {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data as Course[];
}

export async function getCourseById(courseId: number, userId: string) {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .eq('user_id', userId)
    .single();
  if (error) throw new Error(error.message);
  return data as Course;
}

export async function updateCourse(courseId: number, userId: string, updates: Partial<Course>) {
    const { data, error } = await supabase.from('courses').update(updates).eq('id', courseId).eq('user_id', userId).select().single();
    if(error) throw new Error(error.message);
    return data;
}

export async function deleteCourse(courseId: number, userId: string) {
    const { error } = await supabase.from('courses').delete().eq('id', courseId).eq('user_id', userId);
    if(error) throw new Error(error.message);
    return true;
}