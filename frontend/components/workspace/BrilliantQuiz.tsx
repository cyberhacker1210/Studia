'use client';

import { useState, useEffect, useRef } from 'react';
import { Check, X, ArrowDown, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Question {
  id?: number;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

interface BrilliantQuizProps {
  questions: Question[];
  onComplete: (score: number) => void;
  onXpGain: (amount: number) => void;
}

export default function BrilliantQuiz({ questions, onComplete, onXpGain }: BrilliantQuizProps) {
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [validatedSteps, setValidatedSteps] = useState<{ [key: number]: boolean }>({});
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeQuestionIndex > 0) {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [activeQuestionIndex]);

  const handleSelect = (qIndex: number, optionIndex: number) => {
    if (validatedSteps[qIndex]) return;
    setAnswers(prev => ({ ...prev, [qIndex]: optionIndex }));
  };

  const handleValidate = (qIndex: number) => {
    const question = questions[qIndex];
    const isCorrect = answers[qIndex] === question.correct_index;

    setValidatedSteps(prev => ({ ...prev, [qIndex]: true }));

    if (isCorrect) {
      onXpGain(10);
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#FFD700', '#FFA500']
      });
    }
  };

  const handleNext = () => {
    if (activeQuestionIndex < questions.length - 1) {
      setActiveQuestionIndex(prev => prev + 1);
    } else {
      const score = Object.keys(answers).reduce((acc, key) => {
        const idx = Number(key);
        return acc + (answers[idx] === questions[idx].correct_index ? 1 : 0);
      }, 0);
      onComplete(score);
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-32 space-y-12">

      {questions.map((q, idx) => {
        if (idx > activeQuestionIndex) return null;

        const isSelected = answers[idx] !== undefined;
        const isValidated = validatedSteps[idx];
        const isCorrect = isValidated && answers[idx] === q.correct_index;
        const isWrong = isValidated && !isCorrect;

        // CORRECTION : Utilisation de l'index comme clé de secours si pas d'ID
        return (
          <div key={q.id || idx} className={`transition-all duration-700 ${idx === activeQuestionIndex ? 'opacity-100 translate-y-0' : 'opacity-100'}`}>

            <div className={`bg-white border-2 rounded-[2rem] p-8 shadow-sm transition-colors duration-500 ${isValidated ? (isCorrect ? 'border-green-200 bg-green-50/30' : 'border-red-200 bg-red-50/30') : 'border-slate-100'}`}>
              <h3 className="text-xl font-extrabold text-slate-900 mb-6">{q.question}</h3>

              <div className="space-y-3">
                {q.options.map((opt, optIdx) => {
                  const isChosen = answers[idx] === optIdx;
                  let style = "border-slate-200 hover:border-slate-300 hover:bg-slate-50";

                  if (isChosen && !isValidated) style = "border-slate-900 bg-slate-50 ring-1 ring-slate-900";
                  if (isValidated) {
                    if (optIdx === q.correct_index) style = "border-green-500 bg-green-100 text-green-800 font-bold";
                    else if (isChosen && isWrong) style = "border-red-500 bg-red-100 text-red-800";
                    else style = "border-slate-100 opacity-50";
                  }

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelect(idx, optIdx)}
                      disabled={isValidated}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-3 ${style}`}
                    >
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          isValidated && optIdx === q.correct_index ? 'border-green-500 bg-green-500 text-white' : 
                          isValidated && isChosen && isWrong ? 'border-red-500 bg-red-500 text-white' :
                          isChosen ? 'border-slate-900 bg-slate-900' : 'border-slate-300'
                      }`}>
                          {isValidated && optIdx === q.correct_index && <Check size={14} strokeWidth={4}/>}
                          {isValidated && isChosen && isWrong && <X size={14} strokeWidth={4}/>}
                      </div>
                      <span className="text-sm font-medium">{opt}</span>
                    </button>
                  );
                })}
              </div>

              <div className={`grid transition-all duration-500 ease-out ${isValidated ? 'grid-rows-[1fr] opacity-100 mt-6' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                  <div className={`p-4 rounded-xl border-l-4 ${isCorrect ? 'bg-green-100 border-green-500 text-green-900' : 'bg-red-50 border-red-500 text-red-900'}`}>
                    <div className="font-bold mb-1 flex items-center gap-2">
                        {isCorrect ? <><Sparkles size={18}/> Excellent !</> : "Pas tout à fait."}
                    </div>
                    <p className="text-sm leading-relaxed opacity-90">{q.explanation}</p>
                  </div>

                  {idx === activeQuestionIndex && (
                      <button
                        onClick={handleNext}
                        className="mt-6 w-full btn-b-primary py-4 animate-bounce-slow"
                      >
                        <ArrowDown size={20} /> Continuer
                      </button>
                  )}
                </div>
              </div>

              {!isValidated && (
                <div className="mt-6 flex justify-end">
                    <button
                        onClick={() => handleValidate(idx)}
                        disabled={!isSelected}
                        className="btn-b-primary px-8 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Valider
                    </button>
                </div>
              )}
            </div>
          </div>
        );
      })}

      <div ref={bottomRef} className="h-10" />
    </div>
  );
}