'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // 👈 Import du router
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
  const router = useRouter(); // 👈 Hook de navigation
  const [expanded, setExpanded] = useState(false);

  // 🛡️ SÉCURITÉ
  if (!quiz || typeof quiz.score !== 'number' || typeof quiz.total_questions !== 'number') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 flex justify-between items-center animate-in fade-in">
        <span className="text-red-600 text-xs font-bold flex items-center gap-2">
           <AlertCircle size={16} /> Donnée corrompue (ID: {quiz?.id || '?'})
        </span>
        <button onClick={() => onDelete(quiz?.id || 0)} className="text-red-400 hover:text-red-700">
           <Trash2 size={16}/>
        </button>
      </div>
    );
  }

  const percentage = quiz.total_questions > 0 ? Math.round((quiz.score / quiz.total_questions) * 100) : 0;

  const getScoreStyle = (p: number) => {
    if (p >= 80) return { text: 'text-green-600', bg: 'bg-green-100', bar: 'bg-green-500' };
    if (p >= 50) return { text: 'text-yellow-600', bg: 'bg-yellow-100', bar: 'bg-yellow-500' };
    return { text: 'text-red-600', bg: 'bg-red-100', bar: 'bg-red-500' };
  };

  const style = getScoreStyle(percentage);
  const displayId = quiz.quiz_id ? String(quiz.quiz_id).slice(0, 8) : `#${quiz.id}`;

  // Fonction pour lancer la reprise du quiz
  const handleRetake = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/workspace/quiz/retake/${quiz.id}`);
  };

  return (
    <div className="card-b p-0 overflow-hidden group mb-4 transition-all hover:shadow-md">
      <div className="p-6 flex items-center justify-between cursor-pointer" onClick={() => setExpanded(!expanded)}>

        <div className="flex items-center gap-4">
           <div className={`w-16 h-16 rounded-2xl ${style.bg} flex items-center justify-center flex-col shrink-0`}>
              <span className={`text-xl font-black ${style.text}`}>{percentage}%</span>
           </div>

           <div className="flex flex-col justify-center">
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                 {quiz.source === 'image' ? <ImageIcon size={18} className="text-slate-400"/> : <FileText size={18} className="text-slate-400"/>}
                 Quiz {quiz.difficulty === 'hard' ? 'Difficile' : quiz.difficulty === 'easy' ? 'Facile' : 'Moyen'}
              </h3>
              <p className="text-slate-500 text-xs font-bold flex items-center gap-1 mt-1 uppercase tracking-wider">
                 <Calendar size={12}/> {new Date(quiz.created_at).toLocaleDateString()}
              </p>
           </div>
        </div>

        <div className="flex items-center gap-4">
           {/* Bouton REFAIRE (Desktop) */}
           <button
             onClick={handleRetake}
             className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-700 transition-colors"
           >
             <RotateCcw size={16} /> Refaire
           </button>

           <div className="flex items-center gap-2 pl-4 border-l border-slate-100">
               <button
                 onClick={(e) => { e.stopPropagation(); onDelete(quiz.id); }}
                 className="p-2 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-xl transition-colors"
                 title="Supprimer"
               >
                 <Trash2 size={18} />
               </button>
               <div className={`text-slate-300 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}>
                 <ChevronDown size={20} />
               </div>
           </div>
        </div>
      </div>

      <div className={`bg-slate-50/50 px-6 overflow-hidden transition-all duration-300 ease-in-out ${expanded ? 'max-h-40 py-4 border-t border-slate-100' : 'max-h-0'}`}>
         <div className="w-full">
            <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
               <span>Progression globale</span>
               <span>{percentage}%</span>
            </div>
            <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden mb-4">
               <div className={`h-full ${style.bar}`} style={{width: `${percentage}%`}}></div>
            </div>

            <div className="flex justify-between items-center">
                <p className="text-[10px] text-slate-400 font-mono font-bold">
                  ID: {displayId}
                </p>

                {/* Bouton REFAIRE (Mobile - visible quand étendu) */}
                <button
                  onClick={handleRetake}
                  className="sm:hidden flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-sm w-full justify-center"
                >
                  <RotateCcw size={16} /> Refaire ce quiz
                </button>
            </div>
         </div>
      </div>
    </div>
  );
}