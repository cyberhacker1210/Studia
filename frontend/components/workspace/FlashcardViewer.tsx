'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, CheckCircle, XCircle } from 'lucide-react';
import { Flashcard } from '@/lib/flashcardService';

interface FlashcardViewerProps {
  flashcards: Flashcard[];
  onProgress?: (cardIndex: number, remembered: boolean) => void;
}

export default function FlashcardViewer({ flashcards, onProgress }: FlashcardViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [reviewedCards, setReviewedCards] = useState<Set<number>>(new Set());
  const [knownCards, setKnownCards] = useState<Set<number>>(new Set());
  const [toReviewCards, setToReviewCards] = useState<Set<number>>(new Set());
  const [finished, setFinished] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  const [reviewOnlyIndices, setReviewOnlyIndices] = useState<number[]>([]);

  // Déterminer les cartes actives selon le mode
  const activeIndices = reviewMode ? reviewOnlyIndices : flashcards.map((_, i) => i);
  const currentCard = flashcards[activeIndices[currentIndex]];
  const totalCards = activeIndices.length;
  const reviewedCount = reviewedCards.size;
  const progress = Math.round((reviewedCount / totalCards) * 100);

  // Support swipe sur mobile
  useEffect(() => {
    let touchStartX = 0;
    let touchEndX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.changedTouches[0].screenX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    };

    const handleSwipe = () => {
      if (touchEndX < touchStartX - 50) {
        // Swipe left = Next
        if (currentIndex < activeIndices.length - 1) {
          handleNext();
        }
      }
      if (touchEndX > touchStartX + 50) {
        // Swipe right = Previous
        if (currentIndex > 0) {
          handlePrevious();
        }
      }
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [currentIndex, activeIndices]);

  const handleNext = () => {
    setIsFlipped(false);

    if (currentIndex < activeIndices.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setFinished(true);
    }
  };

  const handlePrevious = () => {
    setIsFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleRemembered = (remembered: boolean) => {
    const actualCardIndex = activeIndices[currentIndex];

    if (onProgress) {
      onProgress(actualCardIndex, remembered);
    }

    // Marquer comme révisée
    const newReviewed = new Set(reviewedCards);
    newReviewed.add(actualCardIndex);
    setReviewedCards(newReviewed);

    // Ajouter à la bonne pile
    if (remembered) {
      const newKnown = new Set(knownCards);
      newKnown.add(actualCardIndex);
      setKnownCards(newKnown);

      const newToReview = new Set(toReviewCards);
      newToReview.delete(actualCardIndex);
      setToReviewCards(newToReview);
    } else {
      const newToReview = new Set(toReviewCards);
      newToReview.add(actualCardIndex);
      setToReviewCards(newToReview);

      const newKnown = new Set(knownCards);
      newKnown.delete(actualCardIndex);
      setKnownCards(newKnown);
    }

    handleNext();
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setReviewedCards(new Set());
    setKnownCards(new Set());
    setToReviewCards(new Set());
    setFinished(false);
    setReviewMode(false);
    setReviewOnlyIndices([]);
  };

  const handleReviewAgain = () => {
    if (toReviewCards.size === 0) {
      handleReset();
      return;
    }

    const toReviewIndices = Array.from(toReviewCards).sort((a, b) => a - b);

    console.log('🔄 Mode révision activé');
    console.log('📋 Cartes à revoir:', toReviewIndices);

    setReviewMode(true);
    setReviewOnlyIndices(toReviewIndices);
    setCurrentIndex(0);
    setReviewedCards(new Set());
    setKnownCards(new Set());
    setToReviewCards(new Set());
    setFinished(false);
    setIsFlipped(false);
  };

  // Écran de fin
  if (finished) {
    const knownCount = knownCards.size;
    const toReviewCount = toReviewCards.size;
    const successRate = totalCards > 0 ? Math.round((knownCount / totalCards) * 100) : 0;

    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-0">
        <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-12 text-center border-4 border-green-200">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-green-600 w-12 h-12 sm:w-16 sm:h-16" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            🎉 Session Terminée !
          </h2>

          {reviewMode && (
            <p className="text-gray-600 mb-6">
              Mode révision : {totalCards} cartes révisées
            </p>
          )}

          <div className="grid grid-cols-2 gap-4 sm:gap-6 mb-8">
            <div className="bg-green-50 rounded-xl p-5 sm:p-6 border-2 border-green-200">
              <div className="text-3xl sm:text-4xl font-bold text-green-600 mb-2">
                {knownCount}
              </div>
              <div className="text-xs sm:text-sm text-green-800 font-semibold">
                ✅ Cartes Connues
              </div>
            </div>

            <div className="bg-orange-50 rounded-xl p-5 sm:p-6 border-2 border-orange-200">
              <div className="text-3xl sm:text-4xl font-bold text-orange-600 mb-2">
                {toReviewCount}
              </div>
              <div className="text-xs sm:text-sm text-orange-800 font-semibold">
                🔄 À Revoir
              </div>
            </div>
          </div>

          <div className="mb-8">
            <div className="text-4xl sm:text-5xl font-bold text-gray-900 mb-2">
              {successRate}%
            </div>
            <div className="text-gray-600">Taux de réussite</div>
          </div>

          <div className="space-y-3">
            {toReviewCount > 0 && (
              <button
                onClick={handleReviewAgain}
                className="w-full px-6 sm:px-8 py-3.5 sm:py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold active:scale-95 transition-all shadow-lg touch-manipulation"
              >
                🔄 Réviser les {toReviewCount} cartes à revoir
              </button>
            )}

            <button
              onClick={handleReset}
              className="w-full px-6 sm:px-8 py-3.5 sm:py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 active:scale-95 transition-all shadow-lg touch-manipulation"
            >
              ↻ Recommencer tout le deck
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentCard) {
    return (
      <div className="text-center p-12">
        <p className="text-gray-600">Aucune flashcard disponible</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-0">
      {/* Mode Indicator */}
      {reviewMode && (
        <div className="mb-4 text-center">
          <span className="inline-block px-4 py-2 bg-orange-100 text-orange-700 rounded-lg font-semibold text-sm border border-orange-200">
            🔄 Mode Révision • {totalCards} cartes à revoir
          </span>
        </div>
      )}

      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs sm:text-sm font-medium text-gray-600">
            Carte {currentIndex + 1} sur {totalCards}
            {reviewMode && ` (carte #${activeIndices[currentIndex] + 1})`}
          </span>
          <span className="text-xs sm:text-sm font-medium text-blue-600">
            {reviewedCount}/{totalCards} ({progress}%)
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="flex justify-center gap-3 sm:gap-4 mb-4">
        <div className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-green-50 rounded-lg border border-green-200">
          <CheckCircle size={16} className="text-green-600" />
          <span className="text-xs sm:text-sm font-semibold text-green-700">
            {knownCards.size} connues
          </span>
        </div>
        <div className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-orange-50 rounded-lg border border-orange-200">
          <XCircle size={16} className="text-orange-600" />
          <span className="text-xs sm:text-sm font-semibold text-orange-700">
            {toReviewCards.size} à revoir
          </span>
        </div>
      </div>

      {/* Category Badge */}
      <div className="mb-4 text-center">
        <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs sm:text-sm font-semibold rounded-full border border-purple-200">
          {currentCard.category}
        </span>
      </div>

      {/* Card - Mobile Optimized */}
      <div className="perspective-1000">
        <div
          className={`relative w-full h-[400px] sm:h-96 transition-transform duration-500 transform-style-3d cursor-pointer ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          {/* Front */}
          <div className="absolute w-full h-full backface-hidden">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 h-full flex flex-col items-center justify-center text-white">
              <p className="text-xs sm:text-sm uppercase tracking-wide mb-4 opacity-80">
                Question
              </p>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-6 sm:mb-8 px-2 leading-relaxed">
                {currentCard.front}
              </h2>
              <p className="text-xs sm:text-sm opacity-80 mt-auto">
                👆 Appuyez pour voir la réponse
              </p>
              <p className="text-xs opacity-70 mt-2 sm:hidden">
                👈 👉 Swipe pour naviguer
              </p>
            </div>
          </div>

          {/* Back */}
          <div className="absolute w-full h-full backface-hidden rotate-y-180">
            <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 h-full flex flex-col items-center justify-center text-white">
              <p className="text-xs sm:text-sm uppercase tracking-wide mb-4 opacity-80">
                Réponse
              </p>
              <div className="text-base sm:text-lg md:text-xl text-center mb-6 sm:mb-8 px-2 leading-relaxed">
                {currentCard.back}
              </div>

              {/* Buttons - Mobile Optimized */}
              {!reviewedCards.has(activeIndices[currentIndex]) && (
                <div className="flex gap-3 sm:gap-4 mt-auto w-full px-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemembered(false);
                    }}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 sm:px-6 py-3.5 sm:py-4 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white rounded-xl sm:rounded-2xl font-bold transition-all active:scale-95 shadow-lg text-sm sm:text-base touch-manipulation"
                  >
                    <XCircle size={20} />
                    <span>À revoir</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemembered(true);
                    }}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 sm:px-6 py-3.5 sm:py-4 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white rounded-xl sm:rounded-2xl font-bold transition-all active:scale-95 shadow-lg text-sm sm:text-base touch-manipulation"
                  >
                    <CheckCircle size={20} />
                    <span>Je sais</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation - Mobile Optimized */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-3 text-gray-600 hover:text-gray-900 active:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all rounded-xl font-medium touch-manipulation"
        >
          <ChevronLeft size={24} />
          <span className="hidden sm:inline">Précédent</span>
        </button>

        <button
          onClick={handleReset}
          className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-3 text-gray-600 hover:text-gray-900 active:bg-gray-100 transition-all rounded-xl font-medium touch-manipulation"
        >
          <RotateCcw size={20} />
          <span className="hidden sm:inline">Reset</span>
        </button>

        <button
          onClick={handleNext}
          disabled={currentIndex === activeIndices.length - 1}
          className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-3 text-gray-600 hover:text-gray-900 active:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all rounded-xl font-medium touch-manipulation"
        >
          <span className="hidden sm:inline">Suivant</span>
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Indicator */}
      {reviewedCards.has(activeIndices[currentIndex]) && (
        <div className="mt-4 text-center">
          <span className={`inline-block px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold border ${
            knownCards.has(activeIndices[currentIndex])
              ? 'bg-green-100 text-green-700 border-green-200'
              : 'bg-orange-100 text-orange-700 border-orange-200'
          }`}>
            {knownCards.has(activeIndices[currentIndex]) ? '✅ Marquée comme connue' : '🔄 À revoir'}
          </span>
        </div>
      )}

      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}