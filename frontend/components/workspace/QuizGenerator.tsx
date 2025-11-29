'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Loader2, Brain, Zap } from 'lucide-react';
import ImageUpload from './ImageUpload';
import { generateQuizFromImage, Quiz } from '@/lib/api';
import { saveCourse } from '@/lib/courseService';

interface QuizGeneratorProps {
  onQuizGenerated: (quiz: Quiz) => void;
}

export default function QuizGenerator({ onQuizGenerated }: QuizGeneratorProps) {
  const { user } = useUser();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  const handleImageSelected = (imageData: string) => {
    setSelectedImage(imageData);
    setError(null);
  };

  const handleGenerateQuiz = async () => {
    if (!selectedImage || !user) return;
    try {
      setLoading(true);
      const quiz = await generateQuizFromImage(selectedImage, numQuestions, difficulty);

      // Sauvegarde auto
      if (quiz.extractedText) {
          await saveCourse(user.id, quiz.extractedText, `Quiz Photo - ${new Date().toLocaleDateString()}`);
      }
      onQuizGenerated(quiz);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <ImageUpload onImageSelected={handleImageSelected} selectedImage={selectedImage} onClear={() => setSelectedImage(null)} />

      {selectedImage && (
        <div className="card-b animate-in slide-in-from-bottom-4">
          <h3 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-2">
              <Brain size={24} className="text-blue-600"/> Configuration
          </h3>

          <div className="mb-8">
            <div className="flex justify-between mb-4 font-bold text-slate-700">
                <span>Nombre de questions</span>
                <span className="text-blue-600">{numQuestions}</span>
            </div>
            <input type="range" min="3" max="15" value={numQuestions} onChange={(e) => setNumQuestions(Number(e.target.value))} className="w-full h-3 bg-slate-100 rounded-full appearance-none cursor-pointer accent-slate-900" disabled={loading} />
          </div>

          <div className="mb-8">
            <label className="block font-bold text-slate-700 mb-4">Difficulté</label>
            <div className="grid grid-cols-3 gap-3">
              {(['easy', 'medium', 'hard'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  disabled={loading}
                  className={`py-3 rounded-xl font-bold text-sm transition-all ${
                    difficulty === level
                      ? 'bg-slate-900 text-white shadow-lg scale-105'
                      : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {level === 'easy' && 'Facile'}
                  {level === 'medium' && 'Moyen'}
                  {level === 'hard' && 'Difficile'}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerateQuiz}
            disabled={loading || !user}
            className="w-full btn-b-primary py-4 text-lg"
          >
            {loading ? <><Loader2 className="animate-spin"/> Création...</> : <><Zap/> Générer le Quiz</>}
          </button>

          {error && <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-xl font-bold text-center">{error}</div>}
        </div>
      )}
    </div>
  );
}