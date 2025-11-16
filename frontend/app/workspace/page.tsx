'use client';

import Link from 'next/link';
import {
  FileQuestion,
  BrainCircuit,
  BookOpen,
  Target,
  Sparkles,
  TrendingUp,
  Calendar,
  Award,
  ChevronRight,
  Zap,
  Library,
  Camera
} from 'lucide-react';

export default function WorkspacePage() {
  const features = [
    {
      id: 'quiz',
      title: 'Quiz Generator',
      description: 'Générez des quiz depuis vos photos',
      icon: FileQuestion,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      href: '/workspace/quiz',
      status: 'available',
      badge: 'Populaire',
      badgeColor: 'bg-blue-100 text-blue-700'
    },
    {
      id: 'courses',
      title: 'Mes Cours',
      description: 'Consultez vos cours sauvegardés',
      icon: Library,
      color: 'from-teal-500 to-teal-600',
      bgColor: 'bg-teal-50',
      textColor: 'text-teal-600',
      href: '/workspace/courses',
      status: 'available',
      badge: 'Nouveau',
      badgeColor: 'bg-teal-100 text-teal-700'
    },
    {
      id: 'flashcards',
      title: 'Flashcards AI',
      description: 'Mémorisez avec des flashcards',
      icon: BrainCircuit,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      href: '/workspace/flashcards',
      status: 'available',
      badge: 'Nouveau',
      badgeColor: 'bg-purple-100 text-purple-700'
    },
    {
      id: 'notes',
      title: 'Smart Notes',
      description: 'Notes avec suggestions IA',
      icon: BookOpen,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      href: '/workspace/notes',
      status: 'coming-soon',
      badge: 'Bientôt',
      badgeColor: 'bg-green-100 text-green-700'
    },
    {
      id: 'practice',
      title: 'Entraînement',
      description: 'Exercices adaptatifs',
      icon: Target,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      href: '/workspace/practice',
      status: 'coming-soon',
      badge: 'Bientôt',
      badgeColor: 'bg-orange-100 text-orange-700'
    },
    {
      id: 'ai-tutor',
      title: 'Tuteur IA',
      description: 'Assistant personnel',
      icon: Sparkles,
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50',
      textColor: 'text-pink-600',
      href: '/workspace/tutor',
      status: 'coming-soon',
      badge: 'Futur',
      badgeColor: 'bg-pink-100 text-pink-700'
    },
    {
      id: 'progress',
      title: 'Progression',
      description: 'Vos statistiques',
      icon: TrendingUp,
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600',
      href: '/workspace/progress',
      status: 'coming-soon',
      badge: 'Bientôt',
      badgeColor: 'bg-indigo-100 text-indigo-700'
    }
  ];

  const stats = [
    { label: 'Quiz', value: '0', icon: FileQuestion, color: 'text-blue-600' },
    { label: 'Heures', value: '0h', icon: Calendar, color: 'text-green-600' },
    { label: 'Score', value: '0%', icon: Award, color: 'text-orange-600' },
    { label: 'Série', value: '0j', icon: Zap, color: 'text-purple-600' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
        {/* Header - Mobile & Desktop Optimized */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 px-4">
            Bienvenue sur Studia 👋
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            Votre plateforme d'apprentissage IA
          </p>
        </div>

        {/* Capture Button - BIG Mobile CTA */}
        <div className="mb-8 sm:mb-12 px-4">
          <Link href="/workspace/capture" className="block group touch-manipulation">
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 md:p-12 active:scale-[0.98] hover:scale-[1.02] transition-all duration-200">
              <div className="flex flex-col sm:flex-row items-center justify-between text-white gap-4">
                <div className="text-center sm:text-left flex-1">
                  <div className="inline-block px-3 py-1.5 sm:px-4 sm:py-2 bg-white/20 rounded-full text-xs sm:text-sm font-semibold mb-3 sm:mb-4 backdrop-blur-sm">
                    ⭐ Action Principale
                  </div>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
                    📸 Capturer un Cours
                  </h2>
                  <p className="text-blue-100 text-sm sm:text-base md:text-lg">
                    Photo → IA → Cours sauvegardé
                  </p>
                </div>
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:rotate-12 group-active:rotate-12 transition-transform">
                  <Camera className="text-white w-10 h-10 sm:w-12 sm:h-12" />
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Stats Cards - Mobile Optimized */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 mb-8 sm:mb-12 px-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md active:scale-95 transition-all touch-manipulation"
            >
              <div className="flex items-center justify-between mb-2">
                <stat.icon className={stat.color} size={20} />
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
              <p className="text-xs sm:text-sm text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Features Grid - Mobile First */}
        <div className="mb-8 px-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
            Fonctionnalités
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              const isAvailable = feature.status === 'available';

              const CardContent = (
                <>
                  <div className={`${feature.bgColor} w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-4`}>
                    <Icon className={feature.textColor} size={28} />
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${feature.badgeColor}`}>
                      {feature.badge}
                    </span>
                    {isAvailable && (
                      <ChevronRight className="text-gray-400 group-hover:translate-x-1 group-active:translate-x-1 transition-all" size={20} />
                    )}
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 group-active:text-blue-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>

                  {!isAvailable && (
                    <div className="mt-4 text-xs text-gray-500 flex items-center space-x-1">
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                      <span>Bientôt disponible</span>
                    </div>
                  )}
                </>
              );

              return isAvailable ? (
                <Link
                  key={feature.id}
                  href={feature.href}
                  className="group bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-2xl hover:scale-105 active:scale-[0.98] transition-all duration-200 touch-manipulation"
                >
                  {CardContent}
                </Link>
              ) : (
                <div
                  key={feature.id}
                  className="group bg-white rounded-2xl shadow-lg border border-gray-100 p-6 opacity-60"
                >
                  {CardContent}
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions - Mobile Optimized */}
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 mb-8 px-4">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-xl p-6 sm:p-8 text-white">
            <div className="flex flex-col">
              <div className="mb-4 sm:mb-6">
                <h3 className="text-xl sm:text-2xl font-bold mb-2">
                  Prêt à commencer ? 🚀
                </h3>
                <p className="text-blue-100 text-sm sm:text-base">
                  Quiz en moins d'une minute !
                </p>
              </div>
              <Link
                href="/workspace/quiz"
                className="bg-white text-blue-600 px-6 py-3.5 rounded-xl font-bold hover:bg-blue-50 active:bg-blue-100 transition-all transform hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center space-x-2 touch-manipulation"
              >
                <FileQuestion size={20} />
                <span>Créer un Quiz</span>
                <ChevronRight size={20} />
              </Link>
            </div>
          </div>

          <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl shadow-xl p-6 sm:p-8 text-white">
            <div className="flex flex-col">
              <div className="mb-4 sm:mb-6">
                <h3 className="text-xl sm:text-2xl font-bold mb-2">
                  Vos cours 📚
                </h3>
                <p className="text-teal-100 text-sm sm:text-base">
                  Textes extraits des photos
                </p>
              </div>
              <Link
                href="/workspace/courses"
                className="bg-white text-teal-600 px-6 py-3.5 rounded-xl font-bold hover:bg-teal-50 active:bg-teal-100 transition-all transform hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center space-x-2 touch-manipulation"
              >
                <Library size={20} />
                <span>Mes Cours</span>
                <ChevronRight size={20} />
              </Link>
            </div>
          </div>
        </div>

        {/* Tips Section - Mobile Friendly */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 sm:p-8 mx-4">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
            <Sparkles className="text-blue-600" size={24} />
            <span>💡 Conseils</span>
          </h3>
          <ul className="space-y-3 text-gray-700 text-sm sm:text-base">
            <li className="flex items-start space-x-3">
              <span className="text-blue-600 font-bold flex-shrink-0">1.</span>
              <span>Prenez des photos claires et bien éclairées</span>
            </li>
            <li className="flex items-start space-x-3">
              <span className="text-blue-600 font-bold flex-shrink-0">2.</span>
              <span>Le texte est auto-extrait et sauvegardé</span>
            </li>
            <li className="flex items-start space-x-3">
              <span className="text-blue-600 font-bold flex-shrink-0">3.</span>
              <span>Générez quiz et flashcards à la demande</span>
            </li>
            <li className="flex items-start space-x-3">
              <span className="text-blue-600 font-bold flex-shrink-0">4.</span>
              <span>Révisez avec la répétition espacée</span>
            </li>
            <li className="flex items-start space-x-3">
              <span className="text-blue-600 font-bold flex-shrink-0">5.</span>
              <span>Pratiquez régulièrement pour progresser</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Mobile Bottom Spacing */}
      <div className="h-4 sm:h-0"></div>
    </div>
  );
}