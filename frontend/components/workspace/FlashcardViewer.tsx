'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, Check, X } from 'lucide-react';
import { Flashcard } from '@/lib/flashcardService';
import { useUser } from '@clerk/nextjs';
import { addXp } from '@/lib/gamificationService';

interface FlashcardViewerProps {
  flashcards: Flashcard[];
  onProgress?: (cardIndex: number, remembered: boolean) => void;
}

export default function FlashcardViewer({ flashcards, onProgress }: FlashcardViewerProps) {
  const { user } = useUser();

  // --- State ---
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCount, setKnownCount] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [cardsToReview, setCardsToReview] = useState<Flashcard[]>([]);
  const [activeDeck, setActiveDeck] = useState<Flashcard[]>(flashcards);
  const [mode, setMode] = useState<'normal' | 'review'>('normal');

  const hasAddedXp = useRef(false);
  const currentCard = activeDeck[currentIndex];
  const progress = Math.round(((currentIndex) / activeDeck.length) * 100);

  const handleResponse = (known: boolean) => {
    if (known) {
        setKnownCount(c => c + 1);
    } else {
        setReviewCount(c => c + 1);
        if (!cardsToReview.includes(currentCard)) {
            setCardsToReview(prev => [...prev, currentCard]);
        }
    }

    if (onProgress) onProgress(currentIndex, known);

    if (currentIndex < activeDeck.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(c => c + 1), 150);
    } else {
      setFinished(true);
    }
  };

  useEffect(() => {
    if (finished && user && !hasAddedXp.current) {
      hasAddedXp.current = true;
      const xpGain = 10 + (knownCount * 2);
      addXp(user.id, xpGain, 'Session Flashcards');
    }
  }, [finished, user, knownCount]);

  const startReviewMode = () => {
      setMode('review');
      setActiveDeck(cardsToReview);
      setCardsToReview([]);
      setCurrentIndex(0);
      setKnownCount(0);
      setReviewCount(0);
      setFinished(false);
      setIsFlipped(false);
      hasAddedXp.current = false;
  };

  const resetAll = () => {
      setMode('normal');
      setActiveDeck(flashcards);
      setCardsToReview([]);
      setCurrentIndex(0);
      setKnownCount(0);
      setReviewCount(0);
      setFinished(false);
      setIsFlipped(false);
      hasAddedXp.current = false;
  };

  // Écran de Fin
  if (finished) {
    return (
      <div className="text-center py-16 bg-white border-2 border-slate-100 rounded-[2.5rem] shadow-sm animate-in zoom-in-95 px-6 max-w-2xl mx-auto">
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-sm">🎉</div>
        <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Session terminée !</h2>

        <div className="flex justify-center gap-8 mb-8 mt-8">
          <div className="text-center p-5 bg-green-50 rounded-2xl border border-green-100 min-w-[110px]">
            <div className="text-4xl font-black text-green-600">{knownCount}</div>
            <div className="text-xs font-bold text-green-800 uppercase mt-1">Maîtrisées</div>
          </div>
          <div className="text-center p-5 bg-orange-50 rounded-2xl border border-orange-100 min-w-[110px]">
            <div className="text-4xl font-black text-orange-500">{reviewCount}</div>
            <div className="text-xs font-bold text-orange-800 uppercase mt-1">À revoir</div>
          </div>
        </div>

        <div className="space-y-4 max-w-xs mx-auto">
            {cardsToReview.length > 0 && (
                <button
                    onClick={startReviewMode}
                    className="w-full py-4 rounded-2xl bg-orange-500 text-white font-bold shadow-lg hover:bg-orange-600 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                    <RotateCcw size={18} /> Réviser les {cardsToReview.length} erreurs
                </button>
            )}

            <button
                onClick={resetAll}
                className={`w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${cardsToReview.length > 0 ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'btn-b-primary'}`}
            >
                <RotateCcw size={18} /> Recommencer tout
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto perspective-1000 pb-24 md:pb-0">

      {/* Barre de Progression (Avec plus de marge en bas) */}
      <div className="flex items-center gap-4 mb-10">
        <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
           <div className="h-full bg-slate-900 transition-all duration-300" style={{width: `${progress}%`}} />
        </div>
        <span className="text-xs font-bold text-slate-400">
            {mode === 'review' ? 'Révision' : 'Carte'} {currentIndex + 1} / {activeDeck.length}
        </span>
      </div>

      {/* CARTE : Hauteur augmentée sur Desktop (md:h-[28rem]) */}
      <div
        className={`relative w-full h-[55vh] sm:h-96 md:h-[28rem] cursor-pointer group transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* RECTO */}
        <div className="absolute w-full h-full backface-hidden bg-white border-2 border-slate-200 rounded-[2.5rem] shadow-lg hover:shadow-xl transition-all flex flex-col items-center justify-center p-8 md:p-12 text-center overflow-hidden">
           <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">Question</span>
           <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 overflow-y-auto max-h-[70%] w-full scrollbar-hide leading-tight">
             {currentCard.front}
           </h3>
           <div className="absolute bottom-8 text-slate-400 text-xs font-bold opacity-50 md:opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
             Appuyez pour retourner ↻
           </div>
        </div>

        {/* VERSO */}
        <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-slate-900 rounded-[2.5rem] shadow-xl flex flex-col items-center justify-center p-8 md:p-12 text-center text-white overflow-hidden">
           <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-8">Réponse</span>
           <p className="text-lg md:text-xl font-medium leading-relaxed overflow-y-auto max-h-[80%] w-full scrollbar-hide">
             {currentCard.back}
           </p>
        </div>
      </div>

      {/* BOUTONS : Espace augmenté sur PC (md:mt-10) */}
      <div className={`fixed bottom-20 left-0 w-full p-4 bg-white border-t border-slate-100 md:static md:bg-transparent md:border-0 md:p-0 md:mt-10 z-30 flex gap-4 transition-opacity duration-300 ${isFlipped ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <button
          onClick={() => handleResponse(false)}
          className="flex-1 btn-b-secondary border-red-200 text-red-600 hover:bg-red-50 py-4 text-base shadow-sm"
        >
          <X size={20} /> Pas encore
        </button>
        <button
          onClick={() => handleResponse(true)}
          className="flex-1 btn-b-primary bg-green-600 border-green-800 hover:bg-green-500 py-4 text-base shadow-lg"
        >
          <Check size={20} /> Je savais
        </button>
      </div>

      <style jsx>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}