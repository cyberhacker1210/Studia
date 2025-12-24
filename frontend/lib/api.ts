// Configuration de l'API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

console.log('🔧 API Configuration:', {
  API_BASE_URL,
  env: process.env.NEXT_PUBLIC_API_URL
});

// ============================================
// Types Généraux (Legacy & Utiles)
// ============================================

export interface Quiz {
  id: string;
  source: string;
  difficulty: string;
  questions: QuizQuestion[];
  createdAt: string;
  extractedText: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
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

export interface ExtractTextResult {
  totalImages: number;
  pagesExtracted: number;
  extractedText: string;
  pages: any[];
}

// ============================================
// Types Adaptive Learning (NOUVEAU)
// ============================================

export interface MasteryStep {
    id: number;
    type: 'theory' | 'diagnostic' | 'remediation' | 'exam';
    status: 'locked' | 'unlocked' | 'completed';
    content: any;
}

export interface MasteryPathResponse {
    title: string;
    steps: MasteryStep[];
}

export interface AnalysisResult {
    id: number;
    concept: string;
    understanding_score: number;
    correct_points: string[];
    missing_points: string[];
    misconceptions: string[];
    feedback: string;
}

export interface ExamCorrection {
    feedback_global: string;
    correction_detailee: string;
    weak_concept: string[];
}

// ============================================
// Helper: Error Handling
// ============================================

async function handleApiResponse(response: Response): Promise<any> {
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    throw new Error(`Erreur serveur (${response.status}): Réponse non-JSON`);
  }
  let data;
  try { data = await response.json(); } catch (e) { throw new Error('Impossible de parser le JSON'); }
  if (!response.ok) {
    const errorMessage = data?.detail || data?.message || `Erreur HTTP ${response.status}`;
    throw new Error(errorMessage);
  }
  return data;
}

// ============================================
// Fonctions API Classiques (Legacy)
// ============================================

export async function extractTextFromMultipleImages(images: string[]): Promise<ExtractTextResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/extract-text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ images: images }),
    });
    return await handleApiResponse(response);
  } catch (error) { throw error; }
}

export async function generateQuizFromText(courseText: string, numQuestions: number = 5, difficulty: string = 'medium'): Promise<Quiz> {
  const response = await fetch(`${API_BASE_URL}/api/quiz/generate-from-text`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ course_text: courseText, num_questions: numQuestions, difficulty }),
  });
  return await handleApiResponse(response);
}

export async function generateFlashcards(courseText: string, numCards: number = 10, difficulty: string = 'medium'): Promise<FlashcardDeck> {
  const response = await fetch(`${API_BASE_URL}/api/flashcards/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ course_text: courseText, num_cards: numCards, difficulty }),
  });
  return await handleApiResponse(response);
}

// Placeholder
export async function getCourseById(id: number, userId: string): Promise<any> { return null; }
export async function checkApiHealth(): Promise<boolean> { return true; }


// ============================================
// Fonctions API Adaptive Learning (NOUVEAU)
// ============================================

/** 1. Start Path */
export async function masteryStart(courseText: string, Subject: string): Promise<MasteryPathResponse> {
    const response = await fetch(`${API_BASE_URL}/api/adaptive/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course_text: courseText, subject: Subject })
    });
    return await handleApiResponse(response);
}

/** 2. Analyze Answer */
export async function analyzeStudentAnswer(studentAnswer: string, question: string, expectedPoints: string[]): Promise<AnalysisResult> {
    const response = await fetch(`${API_BASE_URL}/api/adaptive/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_answer: studentAnswer, question: question, expected_points: expectedPoints })
    });
    return await handleApiResponse(response);
}

/** 3. Generate Practice (Flashcards + Exos) */
export async function generatePractice(courseText: string, weakConcepts: string[]): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/adaptive/practice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course_text: courseText, weak_concepts: weakConcepts })
    });
    return await handleApiResponse(response);
}

/** 4. Generate Exam */
export async function generateExam(courseText: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/adaptive/exam`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course_text: courseText })
    });
    return await handleApiResponse(response);
}

/** 5. Evaluate Exam */
export async function evaluateExam(examSubject: string, courseText: string, correctionCriteria: string[], studentAnswers: string): Promise<ExamCorrection> {
    const response = await fetch(`${API_BASE_URL}/api/path/exam/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exam_subject: examSubject, course_text: courseText, correction_criteria: correctionCriteria, student_answers: studentAnswers })
    });
    return await handleApiResponse(response);
}