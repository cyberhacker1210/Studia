'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, FileQuestion, History, Sparkles } from 'lucide-react';

export default function QuizHubPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.push('/workspace')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          Retour au Workspace
        </button>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
              <FileQuestion size={40} className="text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Quiz Generator 🎯
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Créez des quiz à partir de vos cours ou consultez votre historique
          </p>
        </div>

        {/* Options Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">

          {/* Option 1: Créer un Quiz */}
          <button
            onClick={() => router.push('/workspace/quiz/generate')}
            className="group relative overflow-hidden bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 p-10 text-left border-2 border-transparent hover:border-blue-500"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-500 opacity-50"></div>

            <div className="relative z-10">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-6 group-hover:scale-110 transition-all shadow-lg">
                <Sparkles size={40} className="text-white" />
              </div>

              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full mb-4">
                Populaire ⭐
              </span>

              <h2 className="text-3xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                Créer un Quiz
              </h2>

              <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                Sélectionnez un cours et générez un quiz personnalisé en quelques secondes
              </p>

              <div className="flex items-center text-blue-600 font-semibold group-hover:translate-x-2 transition-transform">
                <span>Commencer</span>
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </button>

          {/* Option 2: Historique */}
          <button
            onClick={() => router.push('/workspace/quiz/history')}
            className="group relative overflow-hidden bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 p-10 text-left border-2 border-transparent hover:border-purple-500"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-500 opacity-50"></div>

            <div className="relative z-10">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-6 group-hover:scale-110 transition-all shadow-lg">
                <History size={40} className="text-white" />
              </div>

              <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full mb-4">
                Statistiques 📊
              </span>

              <h2 className="text-3xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">
                Mon Historique
              </h2>

              <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                Consultez vos quiz précédents, vos scores et révisez vos erreurs
              </p>

              <div className="flex items-center text-purple-600 font-semibold group-hover:translate-x-2 transition-transform">
                <span>Voir l'historique</span>
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </button>

        </div>
      </div>
    </div>
  );
}