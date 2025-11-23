'use client';

import { useState, useEffect } from 'react';
import { Star, Loader2, Check, Send, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@clerk/nextjs';

interface Props {
  status: string; // 'uploading', 'extracting', 'saving', 'ready'
  onClose: () => void; // Fonction pour fermer et rediriger
}

export default function LoadingFeedback({ status, onClose }: Props) {
  const { user } = useUser();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [sent, setSent] = useState(false);

  // Est-ce que le cours est prêt ?
  const isReady = status === 'ready';

  const handleSend = async () => {
    if (!user || rating === 0) return;
    try {
      await supabase.from('feedbacks').insert({
        user_id: user.id,
        rating,
        comment
      });
      setSent(true);

      // Si le cours est déjà prêt quand on envoie, on peut proposer de fermer
      if (isReady) {
        setTimeout(onClose, 1500); // Fermeture auto après envoi si prêt
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[9999] top-0 left-0 w-full h-full px-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-300 relative">

        {/* En-tête : État du chargement */}
        <div className="flex flex-col items-center mb-8">
          {isReady ? (
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-bounce">
              <Check className="w-8 h-8 text-green-600" />
            </div>
          ) : (
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
          )}

          <h3 className="text-xl font-bold text-gray-900">
            {isReady ? "Cours généré avec succès !" : "IA au travail..."}
          </h3>

          {!isReady && (
            <p className="text-blue-600 font-medium animate-pulse mt-2 text-sm">
              {status === 'uploading' && "Envoi des images..."}
              {status === 'extracting' && "Analyse du texte..."}
              {status === 'saving' && "Sauvegarde..."}
            </p>
          )}
        </div>

        <hr className="border-gray-100 my-6" />

        {/* Section Avis (Toujours visible tant que pas envoyé) */}
        {!sent ? (
          <div className="text-center">
            <p className="text-gray-600 mb-4 font-medium">
              En attendant, notez votre expérience :
            </p>
            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="hover:scale-110 transition-transform"
                >
                  <Star
                    size={32}
                    className={`${rating >= star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`}
                  />
                </button>
              ))}
            </div>
            <div className="flex gap-2 relative">
              <input
                type="text"
                placeholder="Un petit commentaire ?"
                className="flex-1 bg-gray-50 border rounded-lg px-4 py-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <button
                onClick={handleSend}
                disabled={rating === 0}
                className="bg-blue-600 text-white p-3 rounded-lg disabled:opacity-50 hover:bg-blue-700 transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-green-50 text-green-700 p-4 rounded-lg flex items-center justify-center gap-2 text-center">
            <Check size={20} /> <span>Merci pour votre retour !</span>
          </div>
        )}

        {/* Bouton "Voir mon cours" (Apparaît seulement quand prêt) */}
        {isReady && (
          <div className="mt-8 pt-6 border-t border-gray-100 animate-in fade-in slide-in-from-bottom-4">
            <button
              onClick={onClose}
              className="w-full bg-green-600 text-white font-bold py-4 px-6 rounded-xl hover:bg-green-700 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <span>Accéder à mon cours</span>
              <ArrowRight size={20} />
            </button>
            {!sent && (
              <p className="text-xs text-center text-gray-400 mt-2">
                Vous pouvez finir d'écrire votre avis avant de cliquer.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}