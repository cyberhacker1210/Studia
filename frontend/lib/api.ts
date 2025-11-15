// API Configuration
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '');

console.log('🔗 API_BASE_URL:', API_BASE_URL);

// ============================================
// INTERFACES
// ============================================

export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  source: string;
  difficulty: string;
  questions: Question[];
  createdAt: string;
  extractedText?: string;
}

export interface Flashcard {
  front: string;
  back: string;
  category: string;
  difficulty: string;
}

export interface FlashcardDeck {
  id: string;
  flashcards: Flashcard[];
  createdAt: string;
}

// ============================================
// QUIZ API
// ============================================

/**
 * Générer un quiz depuis une image de cours
 */
export async function generateQuizFromImage(
  imageData: string,
  numQuestions: number = 5,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): Promise<Quiz> {
  const url = `${API_BASE_URL}/api/quiz/generate-from-image`;
  console.log('📡 Requête Quiz (image) vers:', url);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image: imageData,
      num_questions: numQuestions,
      difficulty,
    }),
  });

  console.log('📊 Response status:', response.status);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Not Found' }));
    console.error('❌ API Error:', error);
    throw new Error(error.detail || 'Erreur lors de la génération du quiz');
  }

  const data = await response.json();
  console.log('✅ Quiz reçu:', {
    id: data.id,
    questions: data.questions?.length || 0,
    hasExtractedText: !!data.extractedText,
    extractedTextLength: data.extractedText?.length || 0
  });

  return data;
}

/**
 * Générer un quiz depuis le texte du cours
 */
export async function generateQuizFromText(
  courseText: string,
  numQuestions: number = 5,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): Promise<Quiz> {
  const url = `${API_BASE_URL}/api/quiz/generate-from-text`;
  console.log('📡 Requête Quiz (texte) vers:', url);
  console.log('📝 Texte length:', courseText.length, 'chars');

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      course_text: courseText,
      num_questions: numQuestions,
      difficulty,
    }),
  });

  console.log('📊 Response status:', response.status);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Erreur' }));
    console.error('❌ API Error:', error);
    throw new Error(error.detail || 'Erreur lors de la génération du quiz');
  }

  const data = await response.json();
  console.log('✅ Quiz reçu:', {
    id: data.id,
    questions: data.questions?.length || 0,
    source: data.source
  });

  return data;
}

// ============================================
// FLASHCARDS API
// ============================================

/**
 * Générer des flashcards depuis le texte du cours
 */
export async function generateFlashcards(
  courseText: string,
  numCards: number = 10,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): Promise<FlashcardDeck> {
  const url = `${API_BASE_URL}/api/flashcards/generate`;
  console.log('📡 Requête Flashcards vers:', url);
  console.log('📝 Texte length:', courseText.length, 'chars');

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      course_text: courseText,
      num_cards: numCards,
      difficulty,
    }),
  });

  console.log('📊 Response status:', response.status);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Erreur' }));
    console.error('❌ API Error:', error);
    throw new Error(error.detail || 'Erreur lors de la génération des flashcards');
  }

  const data = await response.json();
  console.log('✅ Flashcards reçues:', {
    id: data.id,
    flashcards: data.flashcards?.length || 0
  });

  return data;
}

// ============================================
// HEALTH CHECK
// ============================================

/**
 * Vérifier que l'API est en ligne
 */
export async function checkAPIHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    return response.ok;
  } catch (error) {
    console.error('❌ API Health Check Failed:', error);
    return false;
  }
}