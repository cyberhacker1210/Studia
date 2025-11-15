'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Trophy, BookOpen, Trash2, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';

interface QuizHistoryCardProps {
  quiz: {
    id: number;
    quiz_data: any;
    score: number;
    total_questions: number;
    created_at: string;
  };
  onDelete: () => void;
}

export default function QuizHistoryCard({ quiz, onDelete }: QuizHistoryCardProps) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);

  const percentage = Math.round((quiz.score / quiz.total_questions) * 100);
  const date = new Date(quiz.created_at).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const getScoreColor = () => {
    if (percentage >= 70) return 'text-green-600 bg-green-50 border-green-200';
    if (percentage >= 50) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const handleRetake = () => {
    router.push(`/workspace/quiz/retake/${quiz.id}`);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              <div className={`px-4 py-2 rounded-full font-bold text-lg border-2 ${getScoreColor()}`}>
                {percentage}%
              </div>
              <div className="flex items-center text-gray-500 text-sm">
                <Calendar size={16} className="mr-1" />
                {date}
              </div>
            </div>

            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
              <div className="flex items-center">
                <Trophy size={16} className="mr-1 text-yellow-600" />
                {quiz.score} / {quiz.total_questions} bonnes réponses
              </div>
              <div className="flex items-center">
                <BookOpen size={16} className="mr-1 text-blue-600" />
                {quiz.total_questions} questions
              </div>
            </div>

            {/* Bouton Refaire */}
            <button
              onClick={handleRetake}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 transition-all transform hover:scale-105 shadow-md"
            >
              <RefreshCw size={18} />
              <span>Refaire ce quiz</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title={expanded ? "Réduire" : "Voir les détails"}
            >
              {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            <button
              onClick={onDelete}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Supprimer"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>
      </div>

      {expanded && quiz.quiz_data?.questions && (
        <div className="border-t border-gray-100 p-6 bg-gray-50">
          <h4 className="font-semibold text-gray-900 mb-4">Questions du Quiz :</h4>
          <div className="space-y-3">
            {quiz.quiz_data.questions.slice(0, 5).map((q: any, idx: number) => (
              <div key={idx} className="bg-white p-3 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-700">
                  <strong>{idx + 1}.</strong> {q.question}
                </p>
              </div>
            ))}
            {quiz.quiz_data.questions.length > 5 && (
              <p className="text-sm text-gray-500 italic">
                ... et {quiz.quiz_data.questions.length - 5} autres questions
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}