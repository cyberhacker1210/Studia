// ============================================
// TYPES
// ============================================

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  source: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questions: QuizQuestion[];
  createdAt: string;
}

// ============================================
// API CONFIGURATION
// ============================================

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Generate quiz from course image
 */
export async function generateQuizFromImage(
  imageData: string,
  numQuestions: number = 5,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): Promise<Quiz> {
  try {
    console.log('🔌 Calling backend:', `${API_URL}/api/quiz/generate-from-image`);
    console.log('📸 Image size:', Math.round(imageData.length / 1024), 'KB');
    console.log('📊 Questions:', numQuestions, '| Difficulty:', difficulty);

    const response = await fetch(`${API_URL}/api/quiz/generate-from-image`, {
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
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(error.detail || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Quiz generated successfully:', data);

    return data;
  } catch (error) {
    console.error('❌ Error generating quiz:', error);
    throw error;
  }
}

/**
 * Check backend health
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/api/health`);
    const data = await response.json();
    return data.status === 'healthy';
  } catch (error) {
    console.error('Backend health check failed:', error);
    return false;
  }
}