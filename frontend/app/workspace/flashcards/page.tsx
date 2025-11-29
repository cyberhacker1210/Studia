'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { getUserFlashcardDecks, deleteFlashcardDeck, FlashcardDeck } from '@/lib/flashcardService';
import { ArrowLeft, Layers, Trash2, Eye, Plus } from 'lucide-react';
import Link from 'next/link';

export default function FlashcardsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
        getUserFlashcardDecks(user.id).then(d => {
            setDecks(d);
            setLoading(false);
        });
    }
  }, [user]);

  const handleDelete = async (e: any, id: number) => {
    e.preventDefault();
    if (!confirm('Supprimer ce deck ?')) return;
    if (!user) return;
    await deleteFlashcardDeck(id, user.id);
    setDecks(decks.filter(d => d.id !== id));
  };

  return (
    <div className="pb-20">
        <div className="flex items-center justify-between mb-10">
          <div>
              <h1 className="text-4xl font-black text-slate-900 mb-2">Mes Flashcards</h1>
              <p className="text-slate-500 font-medium text-lg">Répétition espacée active</p>
          </div>
          <Link href="/workspace/flashcards/generate" className="btn-b-primary hidden md:flex">
              <Plus size={20} /> Générer
          </Link>
        </div>

        {loading ? (
            <div className="grid md:grid-cols-3 gap-6">
                {[1,2,3].map(i => <div key={i} className="h-56 bg-slate-50 rounded-[2rem] animate-pulse"></div>)}
            </div>
        ) : decks.length === 0 ? (
            <div className="text-center py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem]">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                    <Layers size={32} className="text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Aucun deck</h3>
                <p className="text-slate-500 mb-8">Créez des flashcards depuis un cours.</p>
                <Link href="/workspace/courses" className="btn-b-primary inline-flex">
                    Aller aux cours
                </Link>
            </div>
        ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {decks.map((deck) => (
                    <Link href={`/workspace/flashcards/${deck.id}`} key={deck.id} className="group relative bg-white border-2 border-slate-100 rounded-[2rem] p-8 hover:border-slate-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 block">
                        {/* Effet "Pile de cartes" */}
                        <div className="absolute top-0 left-0 w-full h-full bg-slate-50 rounded-[2rem] transform rotate-3 translate-y-2 -z-10 border-2 border-slate-100 group-hover:rotate-6 transition-transform"></div>

                        <div className="flex justify-between items-start mb-6">
                            <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                                {deck.flashcards.length} Cartes
                            </div>
                            <button onClick={(e) => handleDelete(e, deck.id)} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
                        </div>

                        <h3 className="text-xl font-extrabold text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                            {deck.title.replace('Flashcards - ', '')}
                        </h3>

                        <div className="mt-8 flex items-center gap-2 font-bold text-slate-900">
                            <Eye size={18} /> Réviser maintenant
                        </div>
                    </Link>
                ))}
            </div>
        )}
    </div>
  );
}