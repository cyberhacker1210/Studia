'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, FileQuestion, History, Sparkles } from 'lucide-react';

export default function QuizHubPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-8 pb-20">

        {/* Back Button */}
        <button
          onClick={() => router.push('/workspace')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4 sm:mb-6 transition-colors active:scale-95 text-sm sm:text-base"
        >
          <ArrowLeft size={18} className="mr-1.5 sm:mr-2" />
          <span>Retour</span>
        </button>

        {/* Header - Minimaliste */}
        <div className="text-center mb-6 sm:mb-10 px-2">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg mb-3 sm:mb-4">
            <FileQuestion className="text-white" size={28} />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 leading-tight">
            Quiz Generator 🎯
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed">
            Créez ou consultez vos quiz
          </p>
        </div>

        {/* Options Grid - Compact */}
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 max-w-3xl mx-auto mb-8 px-2">

          {/* Option 1: Créer un Quiz */}
          <button
            onClick={() => router.push('/workspace/quiz/generate')}
            className="group relative bg-white rounded-2xl shadow-lg border-2 border-transparent hover:border-blue-500 active:scale-[0.98] transition-all p-5 sm:p-6 text-left overflow-hidden"
          >
            {/* Subtle background decoration */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100 rounded-full -mr-12 -mt-12 opacity-50 group-hover:scale-150 transition-transform duration-500"></div>

            <div className="relative z-10">
              {/* Icon */}
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform shadow-md">
                <Sparkles className="text-white" size={24} />
              </div>

              {/* Badge */}
              <span className="inline-block px-2.5 py-0.5 sm:px-3 sm:py-1 bg-blue-100 text-blue-700 text-[10px] sm:text-xs font-semibold rounded-full mb-3">
                Populaire ⭐
              </span>

              {/* Title */}
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2 leading-tight group-hover:text-blue-600 transition-colors">
                Créer un Quiz
              </h2>

              {/* Description */}
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-4">
                Sélectionnez un cours et générez un quiz personnalisé
              </p>

              {/* Arrow */}
              <div className="flex items-center text-blue-600 font-semibold text-sm group-hover:translate-x-1 transition-transform">
                <span>Commencer</span>
                <svg className="w-4 h-4 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </button>

          {/* Option 2: Historique */}
          <button
            onClick={() => router.push('/workspace/quiz/history')}
            className="group relative bg-white rounded-2xl shadow-lg border-2 border-transparent hover:border-purple-500 active:scale-[0.98] transition-all p-5 sm:p-6 text-left overflow-hidden"
          >
            {/* Subtle background decoration */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-100 rounded-full -mr-12 -mt-12 opacity-50 group-hover:scale-150 transition-transform duration-500"></div>

            <div className="relative z-10">
              {/* Icon */}
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform shadow-md">
                <History className="text-white" size={24} />
              </div>

              {/* Badge */}
              <span className="inline-block px-2.5 py-0.5 sm:px-3 sm:py-1 bg-purple-100 text-purple-700 text-[10px] sm:text-xs font-semibold rounded-full mb-3">
                Statistiques 📊
              </span>

              {/* Title */}
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2 leading-tight group-hover:text-purple-600 transition-colors">
                Mon Historique
              </h2>

              {/* Description */}
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-4">
                Consultez vos quiz précédents et vos scores
              </p>

              {/* Arrow */}
              <div className="flex items-center text-purple-600 font-semibold text-sm group-hover:translate-x-1 transition-transform">
                <span>Voir l'historique</span>
                <svg className="w-4 h-4 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </button>

        </div>

        {/* Info Card - Minimaliste */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 max-w-2xl mx-auto">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Sparkles className="text-blue-600" size={16} />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1.5">
                Comment ça marche ?
              </h3>
              <ul className="space-y-1.5 text-gray-600 text-xs sm:text-sm leading-relaxed">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2 flex-shrink-0">1.</span>
                  <span>Choisissez un cours sauvegardé</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2 flex-shrink-0">2.</span>
                  <span>Configurez le nombre de questions</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2 flex-shrink-0">3.</span>
                  <span>L'IA génère le quiz instantanément</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2 flex-shrink-0">4.</span>
                  <span>Sauvegardez vos résultats</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}