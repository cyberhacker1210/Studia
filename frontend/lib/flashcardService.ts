import { supabase } from './supabase';

export interface Flashcard {
  front: string;
  back: string;
  category: string;
  difficulty: string;
}

export interface FlashcardDeck {
  id: number;
  user_id: string;
  course_id: number | null;
  title: string;
  flashcards: Flashcard[];
  difficulty: string;
  created_at: string;
}

export interface FlashcardProgress {
  id: number;
  user_id: string;
  deck_id: number;
  card_index: number;
  last_reviewed: string;
  ease_factor: number;
  interval_days: number;
  repetitions: number;
}

/**
 * Sauvegarder un deck de flashcards
 */
export async function saveFlashcardDeck(
  userId: string,
  flashcards: Flashcard[],
  title: string,
  difficulty: string,
  courseId?: number
): Promise<FlashcardDeck> {
  const { data, error } = await supabase
    .from('flashcard_decks')
    .insert({
      user_id: userId,
      course_id: courseId || null,
      title,
      flashcards,
      difficulty,
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Récupérer tous les decks d'un utilisateur
 */
export async function getUserFlashcardDecks(userId: string): Promise<FlashcardDeck[]> {
  const { data, error } = await supabase
    .from('flashcard_decks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Récupérer les decks d'un cours spécifique
 */
export async function getCourseFlashcardDecks(
  userId: string,
  courseId: number
): Promise<FlashcardDeck[]> {
  const { data, error } = await supabase
    .from('flashcard_decks')
    .select('*')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Récupérer un deck par ID
 */
export async function getFlashcardDeckById(
  deckId: number,
  userId: string
): Promise<FlashcardDeck | null> {
  const { data, error } = await supabase
    .from('flashcard_decks')
    .select('*')
    .eq('id', deckId)
    .eq('user_id', userId)
    .single();

  if (error) return null;
  return data;
}

/**
 * Supprimer un deck
 */
export async function deleteFlashcardDeck(
  deckId: number,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from('flashcard_decks')
    .delete()
    .eq('id', deckId)
    .eq('user_id', userId);

  if (error) throw error;
}

/**
 * Sauvegarder la progression d'une carte
 */
export async function saveCardProgress(
  userId: string,
  deckId: number,
  cardIndex: number,
  remembered: boolean
): Promise<void> {
  // Récupérer la progression actuelle
  const { data: existing } = await supabase
    .from('flashcard_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('deck_id', deckId)
    .eq('card_index', cardIndex)
    .single();

  let easeFactor = existing?.ease_factor || 2.5;
  let intervalDays = existing?.interval_days || 1;
  let repetitions = existing?.repetitions || 0;

  if (remembered) {
    repetitions += 1;
    if (repetitions === 1) {
      intervalDays = 1;
    } else if (repetitions === 2) {
      intervalDays = 6;
    } else {
      intervalDays = Math.round(intervalDays * easeFactor);
    }
    easeFactor = Math.max(1.3, easeFactor + 0.1);
  } else {
    repetitions = 0;
    intervalDays = 1;
    easeFactor = Math.max(1.3, easeFactor - 0.2);
  }

  const { error } = await supabase
    .from('flashcard_progress')
    .upsert({
      user_id: userId,
      deck_id: deckId,
      card_index: cardIndex,
      last_reviewed: new Date().toISOString(),
      ease_factor: easeFactor,
      interval_days: intervalDays,
      repetitions: repetitions
    });

  if (error) throw error;
}

/**
 * Récupérer la progression d'un deck
 */
export async function getDeckProgress(
  userId: string,
  deckId: number
): Promise<FlashcardProgress[]> {
  const { data, error } = await supabase
    .from('flashcard_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('deck_id', deckId);

  if (error) throw error;
  return data || [];
}