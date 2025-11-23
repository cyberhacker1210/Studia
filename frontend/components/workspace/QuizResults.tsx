'use client';

import { useEffect, useRef } from 'react';
import { CheckCircle, XCircle, RotateCcw, Plus } from 'lucide-react';
import { Quiz } from '@/lib/api';
import { useUser } from '@clerk/nextjs';
// 👇 Import de la gamification
import { addXp } from '@/lib/gamificationService';

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
  const { user } = useUser();
  const hasAddedXp = useRef(false); // Pour éviter de donner l'XP en double

  // Calcul du score
  const score = userAnswers.reduce((acc, answer, index) => {
    return acc + (answer === quiz.questions[index].correctAnswer ? 1 : 0);
  }, 0);

  const percentage = Math.round((score / quiz.questions.length) * 100);

  // 🎉 EFFET : Donner l'XP au chargement du résultat
  useEffect(() => {
    const giveRewards = async () => {
      if (user && !hasAddedXp.current) {
        hasAddedXp.current = true;

        // Formule : 10 XP de base + le pourcentage de réussite
        // Ex: 100% = 110 XP | 50% = 60 XP
        const xpAmount = 10 + percentage;

        await addXp(user.id, xpAmount, `Quiz terminé (${percentage}%)`);
      }
    };
    giveRewards();
  }, [user, percentage]);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 animate-in fade-in slide-in-from-bottom-4">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-blue-50 mb-4 relative">
          <span className="text-4xl font-bold text-blue-600">{percentage}%</span>
          {/* Badge XP */}
          <div className="absolute -right-2 -top-2 bg-yellow-400 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm animate-bounce">
            +{10 + percentage} XP
          </div>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {percentage >= 80 ? 'Excellent ! 🎉' : percentage >= 50 ? 'Bien joué ! 👍' : 'Courage ! 💪'}
        </h2>
        <p className="text-gray-600">
          Vous avez eu {score} bonnes réponses sur {quiz.questions.length}
        </p>
      </div>

      <div className="space-y-6 mb-8">
        {quiz.questions.map((q, index) => {
          const isCorrect = userAnswers[index] === q.correctAnswer;
          return (
            <div
              key={index}
              className={`p-4 rounded-xl border-l-4 ${
                isCorrect
                  ? 'bg-green-50 border-green-500'
                  : 'bg-red-50 border-red-500'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {isCorrect ? (
                    <CheckCircle className="text-green-600" size={20} />
                  ) : (
                    <XCircle className="text-red-600" size={20} />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900 mb-2">{q.question}</p>
                  <p className="text-sm text-gray-600">
                    Votre réponse : <span className={isCorrect ? 'text-green-700 font-semibold' : 'text-red-700 font-semibold'}>
                      {q.options[userAnswers[index]]}
                    </span>
                  </p>
                  {!isCorrect && (
                    <p className="text-sm text-green-700 mt-1">
                      Bonne réponse : <span className="font-semibold">{q.options[q.correctAnswer]}</span>
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-2 italic border-t border-gray-200/50 pt-2">
                    ℹ️ {q.explanation}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={onRetake}
          className="flex items-center justify-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
        >
          <RotateCcw size={20} />
          <span>Réessayer</span>
        </button>
        <button
          onClick={onNewQuiz}
          className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
        >
          <Plus size={20} />
          <span>Nouveau Quiz</span>
        </button>
      </div>
    </div>
  );
}