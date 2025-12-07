'use client';

import { useState } from 'react';
import { Quiz } from '@/lib/api';
import { ChevronRight, Check, X, AlertCircle } from 'lucide-react';

interface QuizDisplayProps {
  quiz: Quiz | { questions: any[] }; // Accepte les deux formats
  onComplete: (answers: number[]) => void;
}

export default function QuizDisplay({ quiz, onComplete }: QuizDisplayProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [status, setStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [answers, setAnswers] = useState<number[]>([]);
  const [shake, setShake] = useState(false);

  // 🛡️ SÉCURITÉ ABSOLUE
  if (!quiz || !quiz.questions || !Array.isArray(quiz.questions) || quiz.questions.length === 0) {
    return (
      <div className="p-8 text-center border-2 border-red-100 rounded-2xl bg-red-50">
        <AlertCircle className="mx-auto mb-2 text-red-500" />
        <p className="font-bold text-red-700">Erreur de chargement du quiz.</p>
        <p className="text-sm text-red-600">Données manquantes ou corrompues.</p>
      </div>
    );
  }

  const question = quiz.questions[currentIdx];

  // 🛡️ SÉCURITÉ QUESTION
  if (!question || !question.options) {
      return <div className="p-4 text-center">Question invalide.</div>;
  }

  const progress = Math.round(((currentIdx) / quiz.questions.length) * 100);

  const handleCheck = () => {
    if (selectedOption === null) return;

    // ✅ CORRECTION MAJEURE : Gestion robuste de l'index correct
    // Certains backends renvoient correct_index, d'autres correctAnswer
    const correctIdx = (question as any).correct_index ?? question.correctAnswer;

    const isCorrect = selectedOption === correctIdx;

    if (isCorrect) {
      setStatus('correct');
    } else {
      setStatus('incorrect');
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }

    const newAnswers = [...answers];
    newAnswers[currentIdx] = selectedOption;
    setAnswers(newAnswers);
  };

  const handleContinue = () => {
    if (currentIdx < quiz.questions.length - 1) {
      setCurrentIdx(c => c + 1);
      setSelectedOption(null);
      setStatus('idle');
    } else {
      onComplete(answers);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4">

      <div className="mb-8">
        <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
           <span>Question {currentIdx + 1} / {quiz.questions.length}</span>
           <span>{progress}%</span>
        </div>
        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-slate-900 transition-all duration-500 ease-out rounded-full" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className={`bg-white border-2 rounded-[2.5rem] p-8 mb-6 shadow-sm transition-all duration-300 ${status === 'incorrect' && shake ? 'animate-shake border-red-200' : 'border-slate-100'}`}>
        <h2 className="text-2xl font-extrabold text-slate-900 mb-8 leading-tight">{question.question}</h2>

        <div className="space-y-3">
          {question.options.map((option: string, index: number) => {
            let borderClass = "border-slate-200 hover:border-slate-300 hover:bg-slate-50";
            let icon = <div className="w-6 h-6 rounded-full border-2 border-slate-300" />;
            let textClass = "text-slate-600";

            if (status === 'idle') {
               if (selectedOption === index) {
                 borderClass = "border-slate-900 bg-slate-50 shadow-md";
                 icon = <div className="w-6 h-6 rounded-full border-2 border-slate-900 bg-slate-900 flex items-center justify-center"><div className="w-2 h-2 bg-white rounded-full"/></div>;
                 textClass = "text-slate-900";
               }
            } else {
               // ✅ CORRECTION VISUELLE : On recalcule l'index ici aussi
               const correctIdx = (question as any).correct_index ?? question.correctAnswer;

               if (index === correctIdx) {
                 borderClass = "border-green-500 bg-green-50";
                 icon = <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white"><Check size={14} strokeWidth={4}/></div>;
                 textClass = "text-green-800";
               } else if (index === selectedOption && status === 'incorrect') {
                 borderClass = "border-red-500 bg-red-50";
                 icon = <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white"><X size={14} strokeWidth={4}/></div>;
                 textClass = "text-red-800";
               } else {
                 borderClass = "border-slate-100 opacity-50";
               }
            }

            return (
              <button
                key={index}
                disabled={status !== 'idle'}
                onClick={() => setSelectedOption(index)}
                className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 flex items-center gap-4 group ${borderClass}`}
              >
                <div className="flex-shrink-0 mt-0.5">{icon}</div>
                <span className={`font-bold text-lg leading-snug ${textClass}`}>{option}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="min-h-[120px]">
        {status === 'idle' ? (
          <div className="flex justify-end pt-4">
            <button onClick={handleCheck} disabled={selectedOption === null} className="btn-b-primary px-10 py-4 text-lg transition-transform active:scale-95">Valider</button>
          </div>
        ) : (
          <div className={`rounded-[2rem] p-6 flex flex-col sm:flex-row items-center justify-between gap-4 animate-pop shadow-lg ${status === 'correct' ? 'bg-green-100 text-green-900' : 'bg-red-50 text-red-900'}`}>
            <div className="text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 font-black text-xl mb-1">
                {status === 'correct' ? <><Check size={28} strokeWidth={3}/> Correct !</> : <><AlertCircle size={28} strokeWidth={3}/> Oups !</>}
              </div>
              <p className="text-sm font-medium opacity-90 mt-1">{question.explanation || (status === 'correct' ? "Bien joué !" : "Regarde la correction.")}</p>
            </div>
            <button onClick={handleContinue} className={`w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-white shadow-md active:scale-95 transition-transform flex items-center justify-center gap-2 ${status === 'correct' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>Continuer <ChevronRight size={20} /></button>
          </div>
        )}
      </div>
    </div>
  );
}