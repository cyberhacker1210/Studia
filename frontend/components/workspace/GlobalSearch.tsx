'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Search, X, BookOpen, Layers, FileQuestion } from 'lucide-react';

interface SearchResult {
  type: 'course' | 'deck' | 'quiz';
  id: number;
  title: string;
  preview: string;
  date: string;
}

export default function GlobalSearch() {
  const { user } = useUser();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  // Raccourci clavier Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const searchTimeout = setTimeout(() => {
      performSearch();
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query, user]);

  const performSearch = async () => {
    if (!user) return;

    setLoading(true);

    try {
      const searchQuery = `%${query}%`;

      // Recherche dans les cours
      const { data: courses } = await supabase
        .from('courses')
        .select('id, title, extracted_text, created_at')
        .eq('user_id', user.id)
        .or(`title.ilike.${searchQuery},extracted_text.ilike.${searchQuery}`)
        .limit(5);

      // Recherche dans les flashcards
      const { data: decks } = await supabase
        .from('flashcard_decks')
        .select('id, title, flashcards, created_at')
        .eq('user_id', user.id)
        .ilike('title', searchQuery)
        .limit(5);

      const allResults: SearchResult[] = [
        ...(courses || []).map(c => ({
          type: 'course' as const,
          id: c.id,
          title: c.title,
          preview: c.extracted_text.substring(0, 100),
          date: c.created_at
        })),
        ...(decks || []).map(d => ({
          type: 'deck' as const,
          id: d.id,
          title: d.title,
          preview: `${d.flashcards.length} cartes`,
          date: d.created_at
        }))
      ];

      setResults(allResults);

    } catch (error) {
      console.error('Erreur recherche:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    if (result.type === 'course') {
      router.push(`/workspace/courses/${result.id}`);
    } else if (result.type === 'deck') {
      router.push(`/workspace/flashcards/${result.id}`);
    }
    setIsOpen(false);
    setQuery('');
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl hover:bg-blue-700 transition-all transform hover:scale-110 flex items-center justify-center"
      >
        <Search size={24} />
      </button>
    );
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={() => setIsOpen(false)}
      />

      {/* Search Modal */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center px-6 py-4 border-b border-gray-200">
            <Search size={20} className="text-gray-400 mr-3" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher dans vos cours, flashcards..."
              className="flex-1 text-lg outline-none"
              autoFocus
            />
            <button
              onClick={() => setIsOpen(false)}
              className="ml-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-400" />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto"></div>
              </div>
            ) : results.length === 0 && query.length >= 2 ? (
              <div className="p-8 text-center text-gray-500">
                Aucun résultat pour "{query}"
              </div>
            ) : (
              <div className="p-2">
                {results.map((result, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleResultClick(result)}
                    className="w-full flex items-start space-x-4 p-4 hover:bg-gray-50 rounded-xl transition-colors text-left"
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      result.type === 'course' ? 'bg-blue-100' :
                      result.type === 'deck' ? 'bg-purple-100' : 'bg-green-100'
                    }`}>
                      {result.type === 'course' && <BookOpen size={20} className="text-blue-600" />}
                      {result.type === 'deck' && <Layers size={20} className="text-purple-600" />}
                      {result.type === 'quiz' && <FileQuestion size={20} className="text-green-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{result.title}</p>
                      <p className="text-sm text-gray-500 truncate">{result.preview}</p>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(result.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
            <span>Tapez pour rechercher</span>
            <span className="flex items-center space-x-2">
              <kbd className="px-2 py-1 bg-white border border-gray-300 rounded">⌘K</kbd>
              <span>pour ouvrir</span>
            </span>
          </div>
        </div>
      </div>
    </>
  );
}