'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { getFlashcardDeckById, FlashcardDeck, saveCardProgress } from '@/lib/flashcardService';
import { ArrowLeft, Loader2, Layers } from 'lucide-react';
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
      console.error('Erreur chargement deck:', err);
      router.push('/workspace/flashcards');
    } finally {
      setLoading(false);
    }
  };

  const handleProgress = async (cardIndex: number, remembered: boolean) => {
    if (!user || !deck) return;
    try {
      await saveCardProgress(user.id, deck.id, cardIndex, remembered);
    } catch (err) {
      console.error('Erreur sauvegarde:', err);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4 animate-pulse">
           <Loader2 className="animate-spin h-10 w-10 text-slate-900" />
           <span className="text-slate-400 font-bold text-sm uppercase tracking-widest">Chargement du deck...</span>
        </div>
      </div>
    );
  }

  if (!deck) return null;

  return (
    <div className="max-w-4xl mx-auto pb-20 pt-6 px-4">
      {/* Header Navigation */}
      <button
        onClick={() => router.push('/workspace/flashcards')}
        className="group flex items-center gap-3 text-slate-500 hover:text-slate-900 mb-10 font-bold text-sm transition-colors"
      >
        <div className="w-10 h-10 rounded-full border-2 border-slate-100 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
           <ArrowLeft size={18} />
        </div>
        Retour aux decks
      </button>

      {/* Titre du Deck */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-4">
           <Layers size={14} /> Mode Révision
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2">
          {deck.title.replace('Flashcards - ', '')}
        </h1>
        <p className="text-slate-500 font-medium">
          {deck.flashcards.length} cartes • Difficulté {deck.difficulty}
        </p>
      </div>

      {/* Zone de Jeu */}
      <div className="animate-in fade-in slide-in-from-bottom-8">
        <FlashcardViewer
          flashcards={deck.flashcards}
          onProgress={handleProgress}
        />
      </div>

      {/* Footer Action */}
      <div className="text-center mt-12">
        <button
          onClick={() => router.push('/workspace/flashcards')}
          className="text-slate-400 hover:text-slate-900 text-sm font-bold transition-colors border-b-2 border-transparent hover:border-slate-900 pb-0.5"
        >
          Choisir un autre deck
        </button>
      </div>
    </div>
  );
}