'use client';

import { useState } from 'react';
import QuizGenerator from '@/components/workspace/QuizGenerator';
import QuizDisplay from '@/components/workspace/QuizDisplay';
import QuizResults from '@/components/workspace/QuizResults';
import { Quiz } from '@/lib/api';

type Step = 'generate' | 'taking' | 'results';

export default function QuizPage() {
  const [step, setStep] = useState<Step>('generate');
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);

  const handleQuizGenerated = (generatedQuiz: Quiz) => {
    setQuiz(generatedQuiz);
    setUserAnswers([]);
    setStep('taking');
  };

  const handleQuizCompleted = (answers: number[]) => {
    setUserAnswers(answers);
    setStep('results');
  };

  const handleRetake = () => {
    setUserAnswers([]);
    setStep('taking');
  };

  const handleNewQuiz = () => {
    setQuiz(null);
    setUserAnswers([]);
    setStep('generate');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Quiz Generator
          </h1>
          <p className="text-lg text-gray-600">
            Photographiez votre cours et générez un quiz instantanément
          </p>
        </div>

        {/* Content - Change selon l'étape */}
        {step === 'generate' && (
          <QuizGenerator onQuizGenerated={handleQuizGenerated} />
        )}

        {step === 'taking' && quiz && (
          <QuizDisplay
            quiz={quiz}
            onComplete={handleQuizCompleted}
          />
        )}

        {step === 'results' && quiz && (
          <QuizResults
            quiz={quiz}
            userAnswers={userAnswers}
            onRetake={handleRetake}
            onNewQuiz={handleNewQuiz}
          />
        )}
      </div>
    </div>
  );
}