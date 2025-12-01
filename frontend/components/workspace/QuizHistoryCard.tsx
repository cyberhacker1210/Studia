'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Trash2, ChevronDown, ChevronUp, FileText, Image as ImageIcon, AlertCircle, RotateCcw } from 'lucide-react';

interface QuizHistoryCardProps {
  quiz: {
    id: number;
    score: number;
    total_questions: number;
    difficulty: string;
    source: string;
    created_at: string;
    quiz_id?: string;
  };
  onDelete: (id: number) => void;
}

export default function QuizHistoryCard({ quiz, onDelete }: QuizHistoryCardProps) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);

  // Sécurité anti-crash
  if (!quiz || typeof quiz.score !== 'number' || typeof quiz.total_questions !== 'number') {
    return null; // On n'affiche pas les données corrompues
  }

  // Calcul du pourcentage
  const percentage = quiz.total_questions > 0
    ? Math.round((quiz.score / quiz.total_questions) * 100)
    : 0;

  // Couleurs dynamiques selon le score
  const getScoreStyle = (p: number) => {
    if (p >= 80) return { text: 'text-green-600', bg: 'bg-green-100', border: 'border-green-200', bar: 'bg-green-500' };
    if (p >= 50) return { text: 'text-yellow-600', bg: 'bg-yellow-100', border: 'border-yellow-200', bar: 'bg-yellow-500' };
    return { text: 'text-red-600', bg: 'bg-red-100', border: 'border-red-200', bar: 'bg-red-500' };
  };

  const style = getScoreStyle(percentage);

  // Action : Refaire le quiz
  const handleRetake = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/workspace/quiz/retake/${quiz.id}`);
  };

  return (
    <div className="bg-white border-2 border-slate-100 rounded-[1.5rem] overflow-hidden hover:border-slate-300 hover:shadow-lg transition-all duration-300 mb-4 group">

      {/* HEADER CARTE */}
      <div className="p-5 sm:p-6 flex items-center justify-between cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-4">

           {/* Badge Score */}
           <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl ${style.bg} border-2 ${style.border} flex items-center justify-center flex-col shrink-0`}>
              <span className={`text-lg sm:text-xl font-black ${style.text}`}>{percentage}%</span>
           </div>

           {/* Infos */}
           <div>
              <h3 className="font-bold text-slate-900 text-base sm:text-lg flex items-center gap-2">
                 {quiz.source === 'image' ? <ImageIcon size={18} className="text-blue-500"/> : <FileText size={18} className="text-purple-500"/>}
                 Quiz {quiz.difficulty === 'hard' ? 'Difficile' : quiz.difficulty === 'easy' ? 'Facile' : 'Moyen'}
              </h3>
              <p className="text-slate-400 text-xs font-bold flex items-center gap-1 mt-1 uppercase tracking-wider">
                 <Calendar size={12}/> {new Date(quiz.created_at).toLocaleDateString()}
              </p>
           </div>
        </div>

        {/* Actions Desktop */}
        <div className="flex items-center gap-3">
           <button
             onClick={handleRetake}
             className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-slate-700 transition-colors shadow-md"
           >
             <RotateCcw size={14} /> Refaire
           </button>

           <div className="flex items-center gap-2 pl-2 sm:pl-4 sm:border-l border-slate-100">
               <button
                 onClick={(e) => { e.stopPropagation(); onDelete(quiz.id); }}
                 className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
               >
                 <Trash2 size={18} />
               </button>
               <div className={`text-slate-300 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}>
                 <ChevronDown size={20} />
               </div>
           </div>
        </div>
      </div>

      {/* DÉTAILS DÉPLIABLES */}
      <div className={`bg-slate-50/50 px-6 overflow-hidden transition-all duration-300 ease-in-out ${expanded ? 'max-h-40 py-4 border-t border-slate-100' : 'max-h-0'}`}>
         <div className="w-full">
            <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
               <span>Score : {quiz.score} / {quiz.total_questions}</span>
               <span>Réussite : {percentage}%</span>
            </div>

            {/* Barre de progression */}
            <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden mb-4">
               <div className={`h-full ${style.bar}`} style={{width: `${percentage}%`}}></div>
            </div>

            {/* Bouton Refaire Mobile */}
            <button
              onClick={handleRetake}
              className="sm:hidden w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-slate-200 text-slate-900 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors"
            >
              <RotateCcw size={16} /> Refaire le quiz
            </button>
         </div>
      </div>
    </div>
  );
}