'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { Flashcard } from '@/lib/flashcardService';

interface FlashcardViewerProps {
  flashcards: Flashcard[];
  onProgress?: (cardIndex: number, remembered: boolean) => void;
}

export default function FlashcardViewer({ flashcards, onProgress }: FlashcardViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [completed, setCompleted] = useState<Set<number>>(new Set());

  const currentCard = flashcards[currentIndex];
  const progress = Math.round(((currentIndex + 1) / flashcards.length) * 100);

  const handleNext = () => {
    setIsFlipped(false);
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    setIsFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleRemembered = (remembered: boolean) => {
    if (onProgress) {
      onProgress(currentIndex, remembered);
    }
    setCompleted(new Set(completed).add(currentIndex));
    handleNext();
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setCompleted(new Set());
  };

  if (!currentCard) {
    return (
      <div className="text-center p-12">
        <p className="text-gray-600">Aucune flashcard disponible</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">
            Carte {currentIndex + 1} sur {flashcards.length}
          </span>
          <span className="text-sm font-medium text-blue-600">
            {progress}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Category Badge */}
      <div className="mb-4">
        <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-sm font-semibold rounded-full">
          {currentCard.category}
        </span>
      </div>

      {/* Card */}
      <div className="perspective-1000">
        <div
          className={`relative w-full h-96 transition-transform duration-500 transform-style-3d cursor-pointer ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          {/* Front */}
          <div className="absolute w-full h-full backface-hidden">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-2xl p-8 h-full flex flex-col items-center justify-center text-white">
              <p className="text-sm uppercase tracking-wide mb-4 opacity-80">
                Question
              </p>
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
                {currentCard.front}
              </h2>
              <p className="text-sm opacity-80 mt-auto">
                Cliquez pour voir la réponse
              </p>
            </div>
          </div>

          {/* Back */}
          <div className="absolute w-full h-full backface-hidden rotate-y-180">
            <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl shadow-2xl p-8 h-full flex flex-col items-center justify-center text-white">
              <p className="text-sm uppercase tracking-wide mb-4 opacity-80">
                Réponse
              </p>
              <div className="text-lg md:text-xl text-center mb-8 leading-relaxed">
                {currentCard.back}
              </div>

              {/* Buttons */}
              <div className="flex gap-4 mt-auto">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemembered(false);
                  }}
                  className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-all"
                >
                  ❌ À revoir
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemembered(true);
                  }}
                  className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-all"
                >
                  ✅ Je connais
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={20} />
          <span>Précédent</span>
        </button>

        <button
          onClick={handleReset}
          className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <RotateCcw size={20} />
          <span>Recommencer</span>
        </button>

        <button
          onClick={handleNext}
          disabled={currentIndex === flashcards.length - 1}
          className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <span>Suivant</span>
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Stats */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            Cartes vues : {completed.size} / {flashcards.length}
          </span>
          <span className="text-gray-600">
            Difficulté : {currentCard.difficulty}
          </span>
        </div>
      </div>

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