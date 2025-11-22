'use client';

import { useState } from 'react';
import { Calendar, Award, BookOpen, Trash2, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';

interface QuizHistoryCardProps {
  quiz: {
    id: number;
    quiz_id: string;
    score: number;
    total_questions: number;
    difficulty: string;
    source: string;
    created_at: string;
    answers: number[];
  };
  onDelete: (id: number) => void;
}

export default function QuizHistoryCard({ quiz, onDelete }: QuizHistoryCardProps) {
  const [expanded, setExpanded] = useState(false);

  const percentage = Math.round((quiz.score / quiz.total_questions) * 100);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'hard':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen size={20} className="text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">
                  Quiz {quiz.source === 'image' ? '📸' : '📝'}
                </h3>
                <p className="text-sm text-gray-600 flex items-center">
                  <Calendar size={14} className="mr-1" />
                  {new Date(quiz.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(quiz.difficulty)}`}>
                {quiz.difficulty === 'easy' && '😊 Facile'}
                {quiz.difficulty === 'medium' && '🎯 Moyen'}
                {quiz.difficulty === 'hard' && '🔥 Difficile'}
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
                {quiz.total_questions} questions
              </span>
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-center space-x-2 mb-2">
              <Award size={16} className="mr-1 text-yellow-600" />
              <span className={`text-3xl font-bold ${getScoreColor(percentage)}`}>
                {percentage}%
              </span>
            </div>
            <p className="text-sm text-gray-600">
              {quiz.score}/{quiz.total_questions}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-3 rounded-full transition-all ${
                percentage >= 80
                  ? 'bg-green-500'
                  : percentage >= 60
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            {expanded ? (
              <>
                <ChevronUp size={18} />
                <span className="text-sm font-medium">Masquer détails</span>
              </>
            ) : (
              <>
                <ChevronDown size={18} />
                <span className="text-sm font-medium">Voir détails</span>
              </>
            )}
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onDelete(quiz.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
              title="Supprimer"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        {/* Expanded Details */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <strong>ID Quiz :</strong> {quiz.quiz_id.slice(0, 8)}...
              </p>
              <p className="text-sm text-gray-600">
                <strong>Source :</strong> {quiz.source === 'image' ? 'Image (OCR)' : 'Texte'}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Réponses :</strong> {quiz.answers.length} enregistrées
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}