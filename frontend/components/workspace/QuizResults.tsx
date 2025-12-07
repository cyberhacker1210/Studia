'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, X, RotateCcw, Plus, History, Loader2 } from 'lucide-react';
import { Quiz } from '@/lib/api';
import { useUser } from '@clerk/nextjs';
import { addXp } from '@/lib/gamificationService';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();
  const hasSaved = useRef(false);
  const [isSaving, setIsSaving] = useState(false);

  const score = userAnswers.reduce((acc, answer, index) => {
    return acc + (answer === quiz.questions[index].correctAnswer ? 1 : 0);
  }, 0);

  const percentage = Math.round((score / quiz.questions.length) * 100);

  useEffect(() => {
    const saveResultAndXp = async () => {
      if (user && !hasSaved.current) {
        hasSaved.current = true;
        setIsSaving(true);

        try {
          // 1. XP
          const xpAmount = 10 + percentage;
          await addXp(user.id, xpAmount, `Quiz terminé (${percentage}%)`);

          console.log("💾 Sauvegarde historique...");

          // ✅ CORRECTION CRITIQUE : Nettoyage des données
          // On crée un objet JSON pur (pas de classes, pas de méthodes)
          const cleanQuizData = {
            questions: quiz.questions.map(q => ({
              question: q.question,
              options: q.options,
              correctAnswer: q.correctAnswer,
              explanation: q.explanation
            }))
          };

          const { error } = await supabase.from('quiz_history').insert({
            user_id: user.id,
            quiz_data: cleanQuizData, // On envoie l'objet propre
            score: score,
            total_questions: quiz.questions.length,
            difficulty: quiz.difficulty || 'medium',
            source: 'text',
            answers: userAnswers,
            created_at: new Date().toISOString()
          });

          if (error) throw error;
          console.log("✅ Sauvegarde réussie");

        } catch (err: any) {
          console.error("❌ Erreur sauvegarde:", err.message || err);
        } finally {
          setIsSaving(false);
        }
      }
    };

    saveResultAndXp();
  }, [user, percentage, quiz, score, userAnswers]);

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4">

      <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-10 text-center shadow-sm mb-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

        {isSaving && (
            <div className="absolute top-4 right-4 flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full animate-pulse">
                <Loader2 size={12} className="animate-spin"/> Sauvegarde...
            </div>
        )}

        <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-slate-900 text-white mb-6 shadow-xl relative">
          <span className="text-5xl font-black tracking-tighter">{percentage}%</span>
          <div className="absolute -right-2 -top-2 bg-yellow-400 text-slate-900 text-xs font-bold px-3 py-1 rounded-full shadow-sm border-2 border-white">
            +{10 + percentage} XP
          </div>
        </div>

        <h2 className="text-3xl font-extrabold text-slate-900 mb-2">
          {percentage >= 80 ? 'Excellent ! 🎉' : percentage >= 50 ? 'Bien joué ! 👍' : 'On continue ! 💪'}
        </h2>
        <p className="text-slate-500 font-medium mb-8">
          {score} bonnes réponses sur {quiz.questions.length}
        </p>

        <div className="flex flex-wrap justify-center gap-3">
           <button onClick={onRetake} className="btn-b-secondary px-5 text-sm">
              <RotateCcw size={16} /> Réessayer
           </button>
           <button onClick={onNewQuiz} className="btn-b-primary px-5 text-sm">
              <Plus size={16} /> Nouveau
           </button>
           <button onClick={() => router.push('/workspace/quiz/history')} className="btn-b-secondary px-5 text-sm border-slate-200 text-slate-500">
              <History size={16} /> Historique
           </button>
        </div>
      </div>

      {/* Correction */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-slate-900 px-2">Correction</h3>
        {quiz.questions.map((q, index) => {
          const isCorrect = userAnswers[index] === q.correctAnswer;
          return (
            <div key={index} className={`p-6 rounded-2xl border-2 transition-all ${
                isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isCorrect ? 'bg-green-200 text-green-700' : 'bg-red-200 text-red-700'
                }`}>
                  {isCorrect ? <Check size={16} strokeWidth={3} /> : <X size={16} strokeWidth={3} />}
                </div>

                <div className="flex-1">
                  <p className="font-bold text-slate-900 mb-2 text-lg">{q.question}</p>

                  <div className="text-sm space-y-1">
                    <p className={`${isCorrect ? 'text-green-700' : 'text-red-700'} font-medium`}>
                      Votre réponse : {q.options[userAnswers[index]]}
                    </p>
                    {!isCorrect && (
                      <p className="text-green-700 font-bold">
                        Bonne réponse : {q.options[q.correctAnswer]}
                      </p>
                    )}
                  </div>

                  {q.explanation && (
                    <div className="mt-4 pt-4 border-t border-black/5 text-sm text-slate-600 italic">
                      💡 {q.explanation}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}