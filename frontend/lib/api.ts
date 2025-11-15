// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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
  extractedText?: string;  // ✨ Texte extrait
}

export async function generateQuizFromImage(
  imageData: string,
  numQuestions: number = 5,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): Promise<Quiz> {
  const response = await fetch(`${API_BASE_URL}/api/quiz/generate-from-image`, {
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

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Erreur lors de la génération du quiz');
  }

  return response.json();
}