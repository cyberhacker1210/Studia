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
    }
  };

  const handlePrevious = () => {
    setCurrentQuestion(currentQuestion - 1);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">
            Question {currentQuestion + 1} of {quiz.questions.length}
          </span>
          <span className="text-sm font-medium text-primary-600">
            {Math.round(((currentQuestion + 1) / quiz.questions.length) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%`,
            }}
          ></div>
        </div>
      </div>

      {/* Question */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {question.question}
        </h2>

        {/* Options */}
        <div className="space-y-3">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleSelectAnswer(index)}
              className={`w-full text-left px-6 py-4 rounded-lg border-2 transition-all ${
                selectedAnswers[currentQuestion] === index
                  ? 'border-primary-600 bg-primary-50 text-primary-900'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedAnswers[currentQuestion] === index
                      ? 'border-primary-600 bg-primary-600'
                      : 'border-gray-300'
                  }`}
                >
                  {selectedAnswers[currentQuestion] === index && (
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  )}
                </div>
                <span className="font-medium">{option}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          className="flex items-center space-x-2 px-6 py-3 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={20} />
          <span>Previous</span>
        </button>

        <button
          onClick={handleNext}
          disabled={!canGoNext}
          className="flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
        >
          <span>{isLastQuestion ? 'Finish Quiz' : 'Next Question'}</span>
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}