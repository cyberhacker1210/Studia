'use client';

import { useState } from 'react';
import { Check, RefreshCw, LayoutList } from 'lucide-react';
import confetti from 'canvas-confetti';

interface StructureItem {
  level: number;
  title: string;
  missing_word: string;
}

interface StructurePuzzleProps {
  items: StructureItem[];
  onComplete: () => void;
}

export default function StructurePuzzle({ items, onComplete }: StructurePuzzleProps) {
  // On mélange une copie pour ne pas toucher l'original
  const [shuffledItems, setShuffledItems] = useState<StructureItem[]>([]);
  const [userOrder, setUserOrder] = useState<StructureItem[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [hasStarted, setHasStarted] = useState(false);

  // Initialisation lazy
  if (!hasStarted && items.length > 0) {
      setShuffledItems([...items].sort(() => Math.random() - 0.5));
      setHasStarted(true);
  }

  const handleSelect = (item: StructureItem) => {
    setUserOrder([...userOrder, item]);
    setShuffledItems(shuffledItems.filter(i => i !== item));
    setIsCorrect(null); // Reset état erreur
  };

  const handleRemove = (item: StructureItem) => {
      setShuffledItems([...shuffledItems, item]);
      setUserOrder(userOrder.filter(i => i !== item));
      setIsCorrect(null);
  };

  const handleReset = () => {
    setShuffledItems([...items].sort(() => Math.random() - 0.5));
    setUserOrder([]);
    setIsCorrect(null);
  };

  const handleCheck = () => {
    // Vérification stricte
    const originalTitles = items.map(i => i.title);
    const userTitles = userOrder.map(i => i.title);

    const correct = JSON.stringify(originalTitles) === JSON.stringify(userTitles);
    setIsCorrect(correct);

    if (correct) {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      setTimeout(onComplete, 2500);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-8 animate-in fade-in">

      {/* Zone de Résultat (Le Plan Construit) */}
      <div className={`min-h-[300px] p-8 rounded-[2rem] border-2 transition-all duration-300 ${isCorrect === true ? 'bg-green-50 border-green-200' : isCorrect === false ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200 border-dashed'}`}>
        {userOrder.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 mt-10">
                <LayoutList size={48} className="mb-4 opacity-20"/>
                <p className="text-sm font-bold uppercase tracking-widest">Touchez les blocs pour reconstruire le plan</p>
            </div>
        )}

        <div className="space-y-3">
            {userOrder.map((item, idx) => (
                <button
                    key={idx}
                    onClick={() => handleRemove(item)}
                    className="w-full text-left flex items-center gap-3 animate-in slide-in-from-bottom-2 group hover:bg-white/50 p-2 rounded-lg transition-colors"
                >
                    <div className={`
                        flex items-center justify-center font-black text-white rounded-lg shrink-0 shadow-sm
                        ${item.level === 1 ? 'w-8 h-8 bg-blue-600 text-sm' : item.level === 2 ? 'w-6 h-6 bg-blue-400 text-xs ml-4' : 'w-5 h-5 bg-blue-300 text-[10px] ml-8'}
                    `}>
                        {item.level === 1 ? 'I' : item.level === 2 ? 'A' : '1'}
                    </div>
                    <span className={`font-bold text-slate-800 ${item.level === 1 ? 'text-lg' : 'text-sm'}`}>
                        {item.title}
                    </span>
                </button>
            ))}
        </div>
      </div>

      {/* Zone de Choix (Les blocs en vrac) */}
      {shuffledItems.length > 0 && (
          <div className="flex flex-wrap gap-3 justify-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
              {shuffledItems.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelect(item)}
                    className="px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-1 active:scale-95 transition-all text-sm font-bold text-slate-700"
                  >
                      {item.title}
                  </button>
              ))}
          </div>
      )}

      {/* Actions */}
      <div className="flex justify-center gap-4 pt-4">
          <button onClick={handleReset} className="p-4 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors" title="Réinitialiser">
              <RefreshCw size={20} />
          </button>

          {shuffledItems.length === 0 && !isCorrect && (
              <button onClick={handleCheck} className="btn-b-primary px-10 py-3 text-lg flex items-center gap-2 shadow-xl hover:scale-105 transition-transform">
                  <Check size={20} strokeWidth={3} /> Vérifier
              </button>
          )}
      </div>

      {isCorrect === false && (
          <div className="text-center bg-red-100 text-red-600 font-bold p-4 rounded-xl animate-shake">
              L'ordre est incorrect. Essayez encore !
          </div>
      )}

      {isCorrect === true && (
          <div className="text-center bg-green-100 text-green-700 font-bold p-4 rounded-xl animate-bounce">
              Parfait ! C'est le bon plan.
          </div>
      )}
    </div>
  );
}