'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import ImageUpload from './ImageUpload';
import { generateQuizFromImage, Quiz } from '@/lib/api';

interface QuizGeneratorProps {
  onQuizGenerated: (quiz: Quiz) => void;
}

export default function QuizGenerator({ onQuizGenerated }: QuizGeneratorProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  const handleImageSelected = (imageData: string) => {
    setSelectedImage(imageData);
    setError(null);
  };

  const handleClear = () => {
    setSelectedImage(null);
    setError(null);
  };

  const handleGenerateQuiz = async () => {
    if (!selectedImage) return;

    try {
      setLoading(true);
      setError(null);

      const quiz = await generateQuizFromImage(selectedImage, numQuestions, difficulty);

      onQuizGenerated(quiz);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la génération du quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Image Upload */}
      <ImageUpload
        onImageSelected={handleImageSelected}
        selectedImage={selectedImage}
        onClear={handleClear}
      />

      {/* Settings - Only show if image is selected */}
      {selectedImage && (
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6">⚙️ Paramètres du Quiz</h3>

          {/* Number of Questions */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Nombre de questions : <span className="text-blue-600 font-bold">{numQuestions}</span>
            </label>
            <input
              type="range"
              min="3"
              max="15"
              value={numQuestions}
              onChange={(e) => setNumQuestions(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              disabled={loading}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>3</span>
              <span>15</span>
            </div>
          </div>

          {/* Difficulty */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Difficulté
            </label>
            <div className="flex gap-3">
              {(['easy', 'medium', 'hard'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  disabled={loading}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all transform hover:scale-105 ${
                    difficulty === level
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {level === 'easy' && '😊 Facile'}
                  {level === 'medium' && '🎯 Moyen'}
                  {level === 'hard' && '🔥 Difficile'}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerateQuiz}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Génération en cours...</span>
              </>
            ) : (
              <>
                <span>✨ Générer le Quiz</span>
              </>
            )}
          </button>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">❌ {error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}