'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { getCourseById, Course } from '@/lib/courseService';
import { generateFlashcards } from '@/lib/api';
import { saveFlashcardDeck } from '@/lib/flashcardService';
import { ArrowLeft, Loader2, Check, Brain, Zap } from 'lucide-react';
import FlashcardViewer from '@/components/workspace/FlashcardViewer';
import { Flashcard } from '@/lib/flashcardService';
import { useEnergy } from '@/hooks/useEnergy';
import { PWAService } from '@/lib/pwaService'; // ✅ IMPORT

type Step = 'config' | 'generating' | 'reviewing' | 'saved';

export default function GenerateFlashcardsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { consumeEnergy, isPremium } = useEnergy();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<Step>('config');
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [deckId, setDeckId] = useState<number | null>(null);
  const [numCards, setNumCards] = useState(10);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  useEffect(() => {
    if (isLoaded && user && params.id) loadCourse();
  }, [isLoaded, user, params.id]);

  const loadCourse = async () => {
    if (!user) return;
    try {
      const data = await getCourseById(Number(params.id), user.id);
      if (!data) router.push('/workspace/courses');
      else setCourse(data);
    } catch (err) {
      router.push('/workspace/courses');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!course || !user) return;

    const canProceed = await consumeEnergy(1);
    if (!canProceed) {
        router.push('/workspace/pricing');
        return;
    }

    try {
      setStep('generating');
      setError(null);
      const result = await generateFlashcards(course.extracted_text, numCards, difficulty);
      setFlashcards(result.flashcards);

      const deck = await saveFlashcardDeck(user.id, result.flashcards, `Flashcards - ${course.title}`, difficulty, course.id);

      // ✅ SAUVEGARDE LOCALE
      await PWAService.saveFlashcardsOffline(deck);

      setDeckId(deck.id);
      setStep('reviewing');
    } catch (err: any) {
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
    return <div className="min-h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin h-8 w-8 text-slate-900" /></div>;
  }
  if (!course) return null;

  return (
    <div className="min-h-screen bg-white text-slate-900 py-12 px-6">
      <div className="max-w-3xl mx-auto">

        {step !== 'saved' && (
          <button onClick={() => router.push(`/workspace/courses/${params.id}`)} className="flex items-center text-slate-500 hover:text-slate-900 mb-8 transition-colors font-medium text-sm">
            <ArrowLeft size={16} className="mr-2" /> Retour
          </button>
        )}

        <div className="mb-10">
            <span className="text-xs font-bold tracking-wider text-blue-600 uppercase mb-2 block">Générateur IA</span>
            <h1 className="text-3xl font-bold text-slate-900">Flashcards sur mesure</h1>
        </div>

        {step === 'config' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-white border-2 border-slate-200 p-8 rounded-[2rem] shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <label className="text-lg font-bold text-slate-900 flex items-center gap-2"><Zap size={20} className="text-yellow-500" /> Quantité</label>
                <span className="text-2xl font-bold text-slate-900">{numCards}</span>
              </div>
              <input type="range" min="5" max="20" value={numCards} onChange={(e) => setNumCards(Number(e.target.value))} className="w-full h-3 bg-slate-100 rounded-full appearance-none cursor-pointer accent-slate-900" />
            </div>

            <div className="bg-white border-2 border-slate-200 p-8 rounded-[2rem] shadow-sm">
              <label className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-6"><Brain size={20} className="text-blue-500" /> Difficulté</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[{ id: 'easy', label: 'Basique' }, { id: 'medium', label: 'Standard' }, { id: 'hard', label: 'Expert' }].map((item) => (
                  <button key={item.id} onClick={() => setDifficulty(item.id as any)} className={`p-4 rounded-2xl border-2 transition-all ${difficulty === item.id ? 'border-slate-900 bg-slate-50' : 'border-slate-100 bg-white'}`}>
                    <div className="font-bold text-slate-900">{item.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <button onClick={handleGenerate} className="w-full btn-b-primary py-4 text-lg flex items-center justify-center gap-2">
              <span>✨ Lancer</span> {!isPremium && <span className="text-xs bg-slate-800 text-yellow-400 px-2 py-1 rounded-full">-1 ⚡️</span>}
            </button>
            {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium text-center">{error}</div>}
          </div>
        )}

        {step === 'generating' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center shadow-sm">
            <Loader2 className="animate-spin h-16 w-16 text-purple-600 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-slate-900">Génération en cours...</h3>
          </div>
        )}

        {step === 'reviewing' && flashcards.length > 0 && (
          <div className="space-y-8 animate-in fade-in">
            <div className="bg-slate-900 text-white rounded-3xl p-8 flex items-center justify-between">
                <h3 className="text-xl font-bold">Deck Prêt !</h3>
                <button onClick={handleSaveAndExit} className="bg-white text-slate-900 px-6 py-2 rounded-full font-bold">Terminer</button>
            </div>
            <div className="bg-white rounded-[2.5rem] shadow-lg border border-slate-100 overflow-hidden">
              <FlashcardViewer flashcards={flashcards} />
            </div>
          </div>
        )}

        {step === 'saved' && (
          <div className="flex flex-col items-center justify-center py-20 animate-in zoom-in duration-500">
            <Check size={48} className="text-green-600 mb-6" />
            <h3 className="text-3xl font-bold text-slate-900">C'est dans la poche !</h3>
          </div>
        )}
      </div>
    </div>
  );
}