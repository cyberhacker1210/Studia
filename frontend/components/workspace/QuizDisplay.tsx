'use client';

import { useState } from 'react';
import { Quiz } from '@/lib/api';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface QuizDisplayProps {
  quiz: Quiz;
  onComplete: (answers: number[]) => void;
}

export default function QuizDisplay({ quiz, onComplete }: QuizDisplayProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>(
    new Array(quiz.questions.length).fill(-1)
  );

  const question = quiz.questions[currentQuestion];
  const isLastQuestion = currentQuestion === quiz.questions.length - 1;
  const canGoNext = selectedAnswers[currentQuestion] !== -1;

  const handleSelectAnswer = (optionIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = optionIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (isLastQuestion) {
      onComplete(selectedAnswers);
    } else {
      setCurrentQuestion(currentQuestion + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    setCurrentQuestion(currentQuestion - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Progress Bar */}
      <div className="p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm sm:text-base font-semibold text-gray-700">
            Question {currentQuestion + 1}/{quiz.questions.length}
          </span>
          <span className="text-sm sm:text-base font-bold text-blue-600">
            {Math.round(((currentQuestion + 1) / quiz.questions.length) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
          <div
            className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%`,
            }}
          ></div>
        </div>
      </div>

      {/* Question */}
      <div className="p-4 sm:p-6 md:p-8">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 leading-snug">
          {question.question}
        </h2>

        {/* Options */}
        <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleSelectAnswer(index)}
              className={`w-full text-left px-4 sm:px-6 py-4 sm:py-5 rounded-xl sm:rounded-2xl border-2 transition-all duration-200 touch-manipulation active:scale-[0.98] ${
                selectedAnswers[currentQuestion] === index
                  ? 'border-blue-600 bg-blue-50 shadow-lg ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-gray-300 active:border-blue-400'
              }`}
            >
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div
                  className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    selectedAnswers[currentQuestion] === index
                      ? 'border-blue-600 bg-blue-600 shadow-md'
                      : 'border-gray-300'
                  }`}
                >
                  {selectedAnswers[currentQuestion] === index && (
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full"></div>
                  )}
                </div>
                <span className={`font-medium text-sm sm:text-base md:text-lg leading-relaxed ${
                  selectedAnswers[currentQuestion] === index
                    ? 'text-blue-900'
                    : 'text-gray-700'
                }`}>
                  {option}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="flex items-center space-x-2 px-4 sm:px-6 py-3 sm:py-3.5 text-gray-600 hover:text-gray-900 active:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all rounded-xl touch-manipulation font-medium text-sm sm:text-base"
          >
            <ChevronLeft size={20} />
            <span className="hidden sm:inline">Précédent</span>
            <span className="sm:hidden">Préc.</span>
          </button>

          <button
            onClick={handleNext}
            disabled={!canGoNext}
            className="flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-6 sm:px-8 py-3.5 sm:py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all font-bold shadow-lg disabled:shadow-none text-sm sm:text-base touch-manipulation"
          >
            <span>{isLastQuestion ? 'Terminer' : 'Suivant'}</span>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}