'use client';

import { Quiz } from '@/lib/api';
import { CheckCircle, XCircle, RotateCcw, Plus } from 'lucide-react';

interface QuizResultsProps {
  quiz: Quiz;
  userAnswers: number[];
  onRetake: () => void;
  onNewQuiz: () => void;
}

export default function QuizResults({
  quiz,
  userAnswers,
  onRetake,
  onNewQuiz,
}: QuizResultsProps) {
  const correctCount = quiz.questions.filter(
    (q, index) => q.correctAnswer === userAnswers[index]
  ).length;

  const percentage = Math.round((correctCount / quiz.questions.length) * 100);

  const getScoreColor = () => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreMessage = () => {
    if (percentage >= 80) return 'Excellent! 🎉';
    if (percentage >= 60) return 'Good job! 👍';
    return 'Keep practicing! 💪';
  };

  return (
    <div className="space-y-6">
      {/* Score Card */}
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          {getScoreMessage()}
        </h2>
        <div className={`text-6xl font-bold mb-2 ${getScoreColor()}`}>
          {percentage}%
        </div>
        <p className="text-lg text-gray-600 mb-6">
          You got {correctCount} out of {quiz.questions.length} questions correct
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onRetake}
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all font-medium"
          >
            <RotateCcw size={20} />
            <span>Retake Quiz</span>
          </button>
          <button
            onClick={onNewQuiz}
            className="flex items-center justify-center space-x-2 px-6 py-3 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-all font-medium"
          >
            <Plus size={20} />
            <span>New Quiz</span>
          </button>
        </div>
      </div>

      {/* Detailed Results */}
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Review Answers</h3>
        <div className="space-y-6">
          {quiz.questions.map((question, index) => {
            const isCorrect = question.correctAnswer === userAnswers[index];
            const userAnswer = userAnswers[index];

            return (
              <div
                key={index}
                className={`p-6 rounded-lg border-2 ${
                  isCorrect
                    ? 'border-green-200 bg-green-50'
                    : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-start space-x-3 mb-4">
                  {isCorrect ? (
                    <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={24} />
                  ) : (
                    <XCircle className="text-red-600 flex-shrink-0 mt-1" size={24} />
                  )}
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 mb-2">
                      Question {index + 1}
                    </p>
                    <p className="text-gray-700 mb-3">{question.question}</p>

                    <div className="space-y-2">
                      <div className={`p-3 rounded ${isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
                        <span className="font-medium">Your answer: </span>
                        {question.options[userAnswer] || 'No answer'}
                      </div>

                      {!isCorrect && (
                        <div className="p-3 rounded bg-green-100">
                          <span className="font-medium">Correct answer: </span>
                          {question.options[question.correctAnswer]}
                        </div>
                      )}

                      {question.explanation && (
                        <div className="p-3 rounded bg-blue-50 text-sm text-gray-700">
                          <span className="font-medium">💡 Explanation: </span>
                          {question.explanation}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}