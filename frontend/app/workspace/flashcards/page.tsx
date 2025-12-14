'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { getUserFlashcardDecks, deleteFlashcardDeck, FlashcardDeck } from '@/lib/flashcardService';
import { ArrowLeft, Layers, Trash2, Eye, Plus, Calendar, Search, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function FlashcardsPage() {
  const { user } = useUser();
  const router = useRouter();
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (user) {
        getUserFlashcardDecks(user.id).then(d => {
            setDecks(d);
            setLoading(false);
        });
    }
  }, [user]);

  const filteredDecks = decks.filter(d =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (e: any, id: number) => {
    e.preventDefault(); e.stopPropagation();
    if (!confirm('Supprimer ce deck ?')) return;
    if (!user) return;
    await deleteFlashcardDeck(id, user.id);
    setDecks(decks.filter(d => d.id !== id));
  };

  return (
    <div className="max-w-6xl mx-auto pb-24 pt-8 px-6 min-h-screen">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
              <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-3 border border-purple-100">
                  <Layers size={14}/> Répétition Espacée
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Mes Flashcards</h1>
          </div>
          <Link href="/workspace/flashcards/generate" className="btn-b-primary py-3 px-6 shadow-lg hover:scale-105 transition-transform flex items-center gap-2">
              <Plus size={20} /> Créer un Deck
          </Link>
      </div>

      {/* Recherche */}
      {decks.length > 0 && (
          <div className="relative max-w-md mb-12 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-600 transition-colors" size={20} />
              <input
                type="text"
                placeholder="Rechercher un deck..."
                className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-700 outline-none focus:border-purple-500 transition-all shadow-sm focus:shadow-md"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
          </div>
      )}

      {/* Grille */}
      {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3].map(i => <div key={i} className="h-56 bg-slate-100 rounded-[2rem] animate-pulse"></div>)}
          </div>
      ) : filteredDecks.length === 0 ? (
          <div className="text-center py-24 bg-white border-2 border-dashed border-slate-200 rounded-[3rem] mt-4">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <Layers size={40} className="text-slate-300" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Aucun deck trouvé.</h3>
              <p className="text-slate-500 mb-8 max-w-sm mx-auto">Créez des flashcards depuis vos cours pour commencer à mémoriser.</p>
              {!searchQuery && (
                  <Link href="/workspace/courses" className="btn-b-primary inline-flex px-8 py-3">
                      Aller aux cours
                  </Link>
              )}
          </div>
      ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
              {filteredDecks.map((deck) => {
                  // Nettoyage du titre "Flashcards - Titre"
                  const cleanTitle = deck.title.replace(/^Flashcards\s*-\s*/i, '');

                  return (
                    <Link href={`/workspace/flashcards/${deck.id}`} key={deck.id} className="group relative block h-full">

                        {/* Effet de pile de cartes (Profondeur) */}
                        <div className="absolute top-0 left-0 w-full h-full bg-slate-900 rounded-[2rem] transform translate-y-2 translate-x-0 transition-transform group-hover:translate-y-3 opacity-10"></div>
                        <div className="absolute top-0 left-0 w-full h-full bg-purple-600 rounded-[2rem] transform translate-y-1 translate-x-0 transition-transform group-hover:translate-y-1.5 opacity-0 group-hover:opacity-100"></div>

                        <div className="relative bg-white border-2 border-slate-100 hover:border-purple-200 rounded-[2rem] p-8 transition-all duration-300 hover:-translate-y-1 h-full flex flex-col justify-between overflow-hidden">

                            {/* Décoration */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>

                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="bg-purple-50 text-purple-700 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider border border-purple-100">
                                        {deck.flashcards.length} Cartes
                                    </div>
                                    <button
                                        onClick={(e) => handleDelete(e, deck.id)}
                                        className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-xl transition-colors"
                                        title="Supprimer"
                                    >
                                        <Trash2 size={18}/>
                                    </button>
                                </div>

                                <h3 className="text-xl font-extrabold text-slate-900 mb-2 line-clamp-2 leading-tight group-hover:text-purple-700 transition-colors">
                                    {cleanTitle}
                                </h3>

                                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mt-4">
                                    <Calendar size={12}/> {new Date(deck.created_at).toLocaleDateString()}
                                </div>
                            </div>

                            <div className="relative z-10 mt-8 pt-6 border-t border-slate-50 flex items-center justify-between group-hover:border-purple-50 transition-colors">
                                <span className="text-xs font-bold text-slate-400 group-hover:text-purple-400 uppercase tracking-wider">
                                    {deck.difficulty || 'Moyen'}
                                </span>
                                <div className="flex items-center gap-2 font-bold text-slate-900 group-hover:text-purple-700 transition-colors text-sm">
                                    <Eye size={18} /> Réviser
                                </div>
                            </div>
                        </div>
                    </Link>
                  )
              })}
          </div>
      )}
    </div>
  );
}