'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { getCourseById, Course } from '@/lib/courseService';
import { generateFlashcards } from '@/lib/api';
import { saveFlashcardDeck } from '@/lib/flashcardService';
import { ArrowLeft, Loader2 } from 'lucide-react';
import FlashcardViewer from '@/components/workspace/FlashcardViewer';
import { Flashcard } from '@/lib/flashcardService';

type Step = 'config' | 'generating' | 'reviewing' | 'saved';

export default function GenerateFlashcardsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<Step>('config');
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [deckId, setDeckId] = useState<number | null>(null);

  const [numCards, setNumCards] = useState(10);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  useEffect(() => {
    if (isLoaded && user && params.id) {
      loadCourse();
    }
  }, [isLoaded, user, params.id]);

  const loadCourse = async () => {
    if (!user) return;

    try {
      const data = await getCourseById(Number(params.id), user.id);
      if (!data) {
        router.push('/workspace/courses');
        return;
      }
      setCourse(data);
    } catch (err) {
      console.error('Erreur:', err);
      router.push('/workspace/courses');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!course || !user) return;

    try {
      setStep('generating');
      setError(null);

      console.log('🎴 Génération flashcards depuis texte du cours...');

      const result = await generateFlashcards(
        course.extracted_text,
        numCards,
        difficulty
      );

      console.log('✅ Flashcards générées:', result.flashcards.length);
      setFlashcards(result.flashcards);

      // Sauvegarder automatiquement
      console.log('💾 Sauvegarde du deck...');
      const deck = await saveFlashcardDeck(
        user.id,
        result.flashcards,
        `Flashcards - ${course.title}`,
        difficulty,
        course.id
      );

      console.log('✅ Deck sauvegardé, ID:', deck.id);
      setDeckId(deck.id);
      setStep('reviewing');

    } catch (err: any) {
      console.error('❌ Erreur:', err);
      setError(err.message);
      setStep('config');
    }
  };

  const handleSaveAndExit = () => {
    setStep('saved');
    setTimeout(() => {
      router.push(`/workspace/courses/${params.id}`);
    }, 2000);
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Loader2 className="animate-spin h-12 w-12 text-blue-600" />
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        {step !== 'saved' && (
          <button
            onClick={() => router.push(`/workspace/courses/${params.id}`)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            Retour au cours
          </button>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🎴 Générer des Flashcards
          </h1>
          <p className="text-lg text-gray-600">
            Depuis : {course.title}
          </p>
        </div>

        {/* Content selon l'étape */}
        {step === 'config' && (
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6">⚙️ Configuration</h3>

            {/* Number of Cards */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Nombre de flashcards : <span className="text-purple-600 font-bold">{numCards}</span>
              </label>
              <input
                type="range"
                min="5"
                max="20"
                value={numCards}
                onChange={(e) => setNumCards(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>5</span>
                <span>20</span>
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
                    className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all transform hover:scale-105 ${
                      difficulty === level
                        ? 'bg-purple-600 text-white shadow-lg'
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

            {/* Info Box */}
            <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-900 mb-2">📚 À propos des flashcards :</h4>
              <ul className="text-sm text-purple-800 space-y-1">
                <li>✓ Questions au recto, réponses au verso</li>
                <li>✓ Concepts clés, définitions, formules</li>
                <li>✓ Méthode de répétition espacée</li>
                <li>✓ Suivez votre progression</li>
              </ul>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              ✨ Générer les Flashcards
            </button>

            {/* Error */}
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">❌ {error}</p>
              </div>
            )}

            {/* Course Info */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>📚 Texte du cours :</strong> {course.extracted_text.length} caractères
              </p>
            </div>
          </div>
        )}

        {step === 'generating' && (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <Loader2 className="animate-spin h-16 w-16 text-purple-600 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Génération en cours...
            </h3>
            <p className="text-gray-600">
              Création de {numCards} flashcards depuis votre cours
            </p>
            <div className="mt-6 flex justify-center space-x-2">
              <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        )}

        {step === 'reviewing' && flashcards.length > 0 && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  ✅ Flashcards générées !
                </h3>
                <button
                  onClick={handleSaveAndExit}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all"
                >
                  ✓ Terminer
                </button>
              </div>
              <p className="text-gray-600">
                {flashcards.length} cartes créées. Commencez la révision ci-dessous.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <FlashcardViewer flashcards={flashcards} />
            </div>

            <div className="text-center">
              <button
                onClick={() => router.push(`/workspace/flashcards/${deckId}`)}
                className="px-8 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all shadow-lg"
              >
                Réviser plus tard
              </button>
            </div>
          </div>
        )}

        {step === 'saved' && (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">✅</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Flashcards sauvegardées !
            </h3>
            <p className="text-gray-600">
              Redirection vers le cours...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}