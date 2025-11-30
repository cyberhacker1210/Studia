'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Loader2, Brain, Zap, FileText, Settings } from 'lucide-react';
import ImageUpload from './ImageUpload';
import { generateQuizFromImage, Quiz } from '@/lib/api';
import { saveCourse } from '@/lib/courseService';
// 👇 Import Hook
import { useEnergy } from '@/hooks/useEnergy';
import { useRouter } from 'next/navigation';

interface QuizGeneratorProps {
  onQuizGenerated: (quiz: Quiz) => void;
}

export default function QuizGenerator({ onQuizGenerated }: QuizGeneratorProps) {
  const { user } = useUser();
  const router = useRouter();

  // 👇 Hook Énergie
  const { consumeEnergy, isPremium } = useEnergy();

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

    // 🛑 VÉRIFICATION ÉNERGIE (Coût: 1)
    const canProceed = await consumeEnergy(1);

    if (!canProceed) {
        if (confirm("⚡️ Énergie épuisée !\n\nVous avez utilisé vos éclairs quotidiens. Passez Premium pour un accès illimité ou attendez demain.\n\nVoir les offres Premium ?")) {
            router.push('/workspace/pricing');
        }
        return;
    }

    try {
      setLoading(true);
      setError(null);

      const quiz = await generateQuizFromImage(selectedImage, numQuestions, difficulty);

      if (quiz.extractedText) {
          const autoTitle = `Quiz Photo - ${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}`;
          await saveCourse(user.id, quiz.extractedText, autoTitle);
      }

      onQuizGenerated(quiz);

    } catch (err: any) {
      console.error("Erreur génération:", err);
      setError(err.message || "Erreur lors de l'analyse de l'image.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">

      <ImageUpload
        onImageSelected={handleImageSelected}
        selectedImage={selectedImage}
        onClear={() => setSelectedImage(null)}
      />

      {selectedImage && (
        <div className="card-b">
          <div className="flex items-center gap-2 mb-8 border-b border-slate-100 pb-4">
              <Settings size={24} className="text-blue-600"/>
              <h3 className="text-xl font-extrabold text-slate-900">Configuration</h3>
          </div>

          <div className="mb-8">
            <div className="flex justify-between mb-4 font-bold text-slate-700">
                <span className="flex items-center gap-2"><FileText size={18}/> Questions</span>
                <span className="text-blue-600 text-xl">{numQuestions}</span>
            </div>
            <input
                type="range"
                min="3"
                max="15"
                value={numQuestions}
                onChange={(e) => setNumQuestions(Number(e.target.value))}
                className="w-full h-4 bg-slate-100 rounded-full appearance-none cursor-pointer accent-slate-900 hover:accent-blue-600 transition-colors"
                disabled={loading}
            />
            <div className="flex justify-between text-xs font-bold text-slate-400 mt-2 uppercase tracking-wider">
                <span>Rapide (3)</span>
                <span>Complet (15)</span>
            </div>
          </div>

          <div className="mb-10">
            <label className="block font-bold text-slate-700 mb-4 flex items-center gap-2">
                <Brain size={18}/> Difficulté
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['easy', 'medium', 'hard'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  disabled={loading}
                  className={`py-3 rounded-xl font-bold text-sm transition-all border-2 ${
                    difficulty === level
                      ? 'bg-slate-900 text-white border-slate-900 shadow-md transform scale-105'
                      : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300 hover:text-slate-700'
                  }`}
                >
                  {level === 'easy' && '🌱 Facile'}
                  {level === 'medium' && '⚡ Moyen'}
                  {level === 'hard' && '🔥 Expert'}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerateQuiz}
            disabled={loading || !user}
            className="w-full btn-b-primary py-4 text-lg shadow-xl hover:shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            {loading ? (
                <>
                    <Loader2 className="animate-spin" size={24}/>
                    Analyse IA en cours...
                </>
            ) : (
                <>
                    <Zap size={20} className="fill-yellow-400 text-yellow-400"/>
                    Générer le Quiz
                    {/* Affichage du coût */}
                    {!isPremium && <span className="ml-2 text-xs bg-slate-800 text-yellow-400 px-2 py-0.5 rounded-full">-1 ⚡️</span>}
                </>
            )}
          </button>

          {error && (
              <div className="mt-6 p-4 bg-red-50 border-2 border-red-100 text-red-600 rounded-2xl font-bold text-center animate-in zoom-in">
                  ⚠️ {error}
              </div>
          )}
        </div>
      )}
    </div>
  );
}