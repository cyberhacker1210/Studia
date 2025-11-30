'use client';

import { useState } from 'react';
import { Quiz } from '@/lib/api';
import { ChevronRight, Check, X, AlertCircle } from 'lucide-react';

interface QuizDisplayProps {
  quiz: Quiz;
  onComplete: (answers: number[]) => void;
}

export default function QuizDisplay({ quiz, onComplete }: QuizDisplayProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [status, setStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [answers, setAnswers] = useState<number[]>([]);
  const [shake, setShake] = useState(false);

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return <div className="p-10 text-center font-bold text-red-500">Erreur: Quiz vide</div>;
  }

  const question = quiz.questions[currentIdx];
  const progress = Math.round(((currentIdx) / quiz.questions.length) * 100);

  const handleCheck = () => {
    if (selectedOption === null) return;
    const isCorrect = selectedOption === question.correctAnswer;
    setStatus(isCorrect ? 'correct' : 'incorrect');
    if (!isCorrect) {
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
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 pb-24 md:pb-0">

      {/* Progress */}
      <div className="mb-6 sm:mb-8">
        <div className="flex justify-between text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
           <span>Question {currentIdx + 1} / {quiz.questions.length}</span>
           <span>{progress}%</span>
        </div>
        <div className="h-2 sm:h-3 w-full bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-slate-900 transition-all duration-500 ease-out rounded-full" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Question Card */}
      <div className={`bg-white border-2 rounded-2xl sm:rounded-[2.5rem] p-5 sm:p-8 mb-6 shadow-sm transition-all duration-300 ${
        status === 'incorrect' && shake ? 'animate-shake border-red-200' : 'border-slate-100'
      }`}>
        <h2 className="text-lg sm:text-2xl font-extrabold text-slate-900 mb-6 sm:mb-8 leading-snug">
          {question.question}
        </h2>

        <div className="space-y-3">
          {question.options.map((option, index) => {
            let borderClass = "border-slate-200 active:scale-[0.98]";
            let bgClass = "active:bg-slate-50";
            let icon = <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-slate-300" />;
            let textClass = "text-slate-600";

            if (status === 'idle') {
               if (selectedOption === index) {
                 borderClass = "border-slate-900 shadow-md transform -translate-y-0.5";
                 bgClass = "bg-slate-50";
                 icon = <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-slate-900 bg-slate-900 flex items-center justify-center"><div className="w-2 h-2 bg-white rounded-full"/></div>;
                 textClass = "text-slate-900";
               }
            } else {
               if (index === question.correctAnswer) {
                 borderClass = "border-green-500 bg-green-50";
                 bgClass = "";
                 icon = <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-green-500 flex items-center justify-center text-white"><Check size={12} strokeWidth={4}/></div>;
                 textClass = "text-green-800";
               } else if (index === selectedOption && status === 'incorrect') {
                 borderClass = "border-red-500 bg-red-50";
                 bgClass = "";
                 icon = <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-red-500 flex items-center justify-center text-white"><X size={12} strokeWidth={4}/></div>;
                 textClass = "text-red-800";
               } else {
                 borderClass = "border-slate-100 opacity-50";
                 bgClass = "";
               }
            }

            return (
              <button
                key={index}
                disabled={status !== 'idle'}
                onClick={() => setSelectedOption(index)}
                className={`w-full text-left p-4 sm:p-5 rounded-xl sm:rounded-2xl border-2 transition-all duration-200 flex items-start gap-3 sm:gap-4 group ${borderClass} ${bgClass}`}
              >
                <div className="flex-shrink-0 mt-0.5">{icon}</div>
                <span className={`font-bold text-sm sm:text-lg leading-snug ${textClass}`}>{option}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sticky Footer Action on Mobile */}
      <div className="fixed bottom-20 left-0 w-full p-4 bg-white border-t border-slate-100 md:static md:bg-transparent md:border-0 md:p-0 z-30">
        {status === 'idle' ? (
          <button
            onClick={handleCheck}
            disabled={selectedOption === null}
            className="btn-b-primary w-full md:w-auto md:px-10 md:float-right"
          >
            Valider
          </button>
        ) : (
          <div className={`rounded-xl sm:rounded-[2rem] p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 animate-pop shadow-lg ${
            status === 'correct' ? 'bg-green-100 text-green-900' : 'bg-red-50 text-red-900'
          }`}>
            <div className="text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 font-black text-lg sm:text-xl mb-1">
                {status === 'correct' ? <><Check size={24}/> Correct !</> : <><AlertCircle size={24}/> Oups !</>}
              </div>
              {question.explanation && (
                 <p className="text-xs sm:text-sm font-medium opacity-90 mt-1 max-w-md leading-relaxed hidden sm:block">
                    {question.explanation}
                 </p>
              )}
            </div>
            <button
              onClick={handleContinue}
              className={`w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-white shadow-md active:scale-95 transition-transform flex items-center justify-center gap-2 ${
                status === 'correct' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              Continuer <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}