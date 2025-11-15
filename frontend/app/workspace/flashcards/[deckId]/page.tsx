'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { getFlashcardDeckById, FlashcardDeck, saveCardProgress } from '@/lib/flashcardService';
import { ArrowLeft, Loader2 } from 'lucide-react';
import FlashcardViewer from '@/components/workspace/FlashcardViewer';

export default function FlashcardReviewPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [deck, setDeck] = useState<FlashcardDeck | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && user && params.deckId) {
      loadDeck();
    }
  }, [isLoaded, user, params.deckId]);

  const loadDeck = async () => {
    if (!user) return;

    try {
      const data = await getFlashcardDeckById(Number(params.deckId), user.id);
      if (!data) {
        router.push('/workspace/flashcards');
        return;
      }
      setDeck(data);
    } catch (err) {
      console.error('Erreur:', err);
      router.push('/workspace/flashcards');
    } finally {
      setLoading(false);
    }
  };

  const handleProgress = async (cardIndex: number, remembered: boolean) => {
    if (!user || !deck) return;

    try {
      await saveCardProgress(user.id, deck.id, cardIndex, remembered);
      console.log(`✅ Progression sauvegardée: carte ${cardIndex}, connu: ${remembered}`);
    } catch (err) {
      console.error('Erreur sauvegarde progression:', err);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Loader2 className="animate-spin h-12 w-12 text-purple-600" />
      </div>
    );
  }

  if (!deck) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <button
          onClick={() => router.push('/workspace/flashcards')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          Retour aux flashcards
        </button>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {deck.title}
          </h1>
          <p className="text-gray-600">
            {deck.flashcards.length} cartes • {deck.difficulty}
          </p>
        </div>

        {/* Flashcard Viewer */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <FlashcardViewer
            flashcards={deck.flashcards}
            onProgress={handleProgress}
          />
        </div>

        {/* Back to List */}
        <div className="text-center mt-8">
          <button
            onClick={() => router.push('/workspace/flashcards')}
            className="px-8 py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-lg"
          >
            Voir tous mes decks
          </button>
        </div>
      </div>
    </div>
  );
}