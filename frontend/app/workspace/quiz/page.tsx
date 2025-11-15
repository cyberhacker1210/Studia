'use client';

import { useRouter } from 'next/navigation';
import { Sparkles, History, BookOpen, Trophy, TrendingUp } from 'lucide-react';

export default function QuizHubPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
              <BookOpen size={40} className="text-white" />
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

          {/* Option 1: Générer un Quiz */}
          <button
            onClick={() => router.push('/workspace/quiz/generate')}
            className="group relative overflow-hidden bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 p-10 text-left border-2 border-transparent hover:border-blue-500"
          >
            {/* Animated Background Circle */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-500 opacity-50"></div>

            <div className="relative z-10">
              {/* Icon */}
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-6 group-hover:scale-110 transition-all shadow-lg">
                <Sparkles size={40} className="text-white" />
              </div>

              {/* Badge */}
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full mb-4">
                Populaire ⭐
              </span>

              {/* Title */}
              <h2 className="text-3xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                Générer un Quiz
              </h2>

              {/* Description */}
              <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                Prenez une photo de votre cours et créez un quiz personnalisé en quelques secondes grâce à l'IA
              </p>

              {/* Features List */}
              <ul className="space-y-2 mb-6">
                <li className="flex items-center text-sm text-gray-700">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Génération instantanée
                </li>
                <li className="flex items-center text-sm text-gray-700">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Questions personnalisées
                </li>
                <li className="flex items-center text-sm text-gray-700">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Explications détaillées
                </li>
              </ul>

              {/* CTA */}
              <div className="flex items-center text-blue-600 font-semibold group-hover:translate-x-2 transition-transform">
                <span>Commencer</span>
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </button>

          {/* Option 2: Mes Quiz */}
          <button
            onClick={() => router.push('/workspace/quiz/history')}
            className="group relative overflow-hidden bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 p-10 text-left border-2 border-transparent hover:border-purple-500"
          >
            {/* Animated Background Circle */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-500 opacity-50"></div>

            <div className="relative z-10">
              {/* Icon */}
              <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-6 group-hover:scale-110 transition-all shadow-lg">
                <History size={40} className="text-white" />
              </div>

              {/* Badge */}
              <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full mb-4">
                Statistiques 📊
              </span>

              {/* Title */}
              <h2 className="text-3xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">
                Mes Quiz Sauvegardés
              </h2>

              {/* Description */}
              <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                Consultez vos quiz précédents, vos scores et révisez vos erreurs pour progresser
              </p>

              {/* Features List */}
              <ul className="space-y-2 mb-6">
                <li className="flex items-center text-sm text-gray-700">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Historique complet
                </li>
                <li className="flex items-center text-sm text-gray-700">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Suivi des performances
                </li>
                <li className="flex items-center text-sm text-gray-700">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Révision ciblée
                </li>
              </ul>

              {/* CTA */}
              <div className="flex items-center text-purple-600 font-semibold group-hover:translate-x-2 transition-transform">
                <span>Voir l'historique</span>
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </button>

        </div>

        {/* Stats Preview */}
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-5xl mx-auto border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <TrendingUp className="mr-2 text-blue-600" size={24} />
            Aperçu Rapide
          </h3>
          <div className="grid grid-cols-3 gap-6 text-center">
            <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <BookOpen size={24} className="text-white" />
              </div>
              <p className="text-3xl font-bold text-blue-600 mb-1">-</p>
              <p className="text-sm text-gray-700 font-medium">Quiz Générés</p>
            </div>
            <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Trophy size={24} className="text-white" />
              </div>
              <p className="text-3xl font-bold text-green-600 mb-1">-%</p>
              <p className="text-sm text-gray-700 font-medium">Score Moyen</p>
            </div>
            <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <History size={24} className="text-white" />
              </div>
              <p className="text-3xl font-bold text-purple-600 mb-1">-</p>
              <p className="text-sm text-gray-700 font-medium">Questions Répondues</p>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center mt-8">
          <button
            onClick={() => router.push('/workspace')}
            className="text-gray-600 hover:text-gray-900 font-medium transition-colors flex items-center mx-auto"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour au Workspace
          </button>
        </div>
      </div>
    </div>
  );
}