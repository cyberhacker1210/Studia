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
      description: 'Mémorisez efficacement',
      icon: BrainCircuit,
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
      description: 'Notes intelligentes',
      icon: BookOpen,
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
      bgColor: 'bg-pink-50',
      textColor: 'text-pink-600',
      href: '/workspace/tutor',
      status: 'coming-soon',
      badge: 'Futur',
      badgeColor: 'bg-pink-100 text-pink-700'
    },
  ];

  const stats = [
    { label: 'Quiz', value: '0', icon: FileQuestion, color: 'text-blue-600' },
    { label: 'Heures', value: '0h', icon: Calendar, color: 'text-green-600' },
    { label: 'Score', value: '0%', icon: Award, color: 'text-orange-600' },
    { label: 'Série', value: '0j', icon: Zap, color: 'text-purple-600' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8 pb-20">

        {/* Header */}
        <div className="text-center mb-6 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2 sm:mb-3 px-2 leading-tight">
            Bienvenue sur Studia 👋
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 px-3 leading-relaxed">
            Votre plateforme d'apprentissage IA
          </p>
        </div>

        {/* Capture Button - Big CTA */}
        <div className="mb-6 sm:mb-10 px-2">
          <Link href="/workspace/capture" className="block group">
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl sm:rounded-3xl shadow-xl p-5 sm:p-8 active:scale-[0.98] hover:scale-[1.01] transition-transform duration-200">
              <div className="flex flex-col sm:flex-row items-center justify-between text-white gap-4">
                <div className="text-center sm:text-left flex-1 w-full">
                  <div className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-semibold mb-3 backdrop-blur-sm">
                    ⭐ Action Principale
                  </div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 leading-tight">
                    📸 Capturer un Cours
                  </h2>
                  <p className="text-blue-100 text-xs sm:text-sm md:text-base leading-relaxed">
                    Photo → IA → Cours sauvegardé
                  </p>
                </div>
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm flex-shrink-0">
                  <Camera className="text-white w-8 h-8 sm:w-10 sm:h-10" />
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-6 sm:mb-10 px-2">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-5 hover:shadow-md transition-shadow"
            >
              <stat.icon className={`${stat.color} mb-2`} size={18} />
              <p className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 leading-none">{stat.value}</p>
              <p className="text-[10px] sm:text-xs text-gray-600 leading-tight">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="mb-6 sm:mb-10 px-2">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4 leading-tight">
            Fonctionnalités
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
            {features.map((feature) => {
              const Icon = feature.icon;
              const isAvailable = feature.status === 'available';

              const CardContent = (
                <>
                  <div className={`${feature.bgColor} w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mb-3`}>
                    <Icon className={feature.textColor} size={24} />
                  </div>

                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] sm:text-xs font-semibold px-2 py-0.5 sm:px-3 sm:py-1 rounded-full ${feature.badgeColor}`}>
                      {feature.badge}
                    </span>
                    {isAvailable && (
                      <ChevronRight className="text-gray-400 group-hover:translate-x-1 transition-transform" size={18} />
                    )}
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1.5 leading-tight">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                    {feature.description}
                  </p>

                  {!isAvailable && (
                    <div className="mt-3 text-[10px] sm:text-xs text-gray-500 flex items-center space-x-1">
                      <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
                      <span>Bientôt disponible</span>
                    </div>
                  )}
                </>
              );

              return isAvailable ? (
                <Link
                  key={feature.id}
                  href={feature.href}
                  className="group bg-white rounded-xl shadow-md border border-gray-100 p-4 sm:p-5 hover:shadow-xl active:scale-[0.98] transition-all"
                >
                  {CardContent}
                </Link>
              ) : (
                <div
                  key={feature.id}
                  className="bg-white rounded-xl shadow-md border border-gray-100 p-4 sm:p-5 opacity-60"
                >
                  {CardContent}
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-2 gap-3 sm:gap-5 mb-6 sm:mb-10 px-2">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-xl p-5 sm:p-6 text-white">
            <div className="mb-4">
              <h3 className="text-lg sm:text-xl font-bold mb-1.5 leading-tight">
                Prêt ? 🚀
              </h3>
              <p className="text-blue-100 text-xs sm:text-sm leading-relaxed">
                Quiz en 1 minute !
              </p>
            </div>
            <Link
              href="/workspace/quiz"
              className="block w-full bg-white text-blue-600 px-5 py-3 rounded-xl font-bold active:bg-blue-50 transition-all shadow-lg flex items-center justify-center space-x-2 text-sm sm:text-base"
            >
              <FileQuestion size={18} />
              <span>Créer un Quiz</span>
              <ChevronRight size={18} />
            </Link>
          </div>

          <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl shadow-xl p-5 sm:p-6 text-white">
            <div className="mb-4">
              <h3 className="text-lg sm:text-xl font-bold mb-1.5 leading-tight">
                Vos cours 📚
              </h3>
              <p className="text-teal-100 text-xs sm:text-sm leading-relaxed">
                Textes extraits
              </p>
            </div>
            <Link
              href="/workspace/courses"
              className="block w-full bg-white text-teal-600 px-5 py-3 rounded-xl font-bold active:bg-teal-50 transition-all shadow-lg flex items-center justify-center space-x-2 text-sm sm:text-base"
            >
              <Library size={18} />
              <span>Mes Cours</span>
              <ChevronRight size={18} />
            </Link>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 sm:p-6 mx-2">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 flex items-center space-x-2">
            <Sparkles className="text-blue-600" size={20} />
            <span>💡 Conseils</span>
          </h3>
          <ul className="space-y-2 text-gray-700 text-xs sm:text-sm leading-relaxed">
            <li className="flex items-start space-x-2">
              <span className="text-blue-600 font-bold flex-shrink-0">1.</span>
              <span>Photos claires et bien éclairées</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-600 font-bold flex-shrink-0">2.</span>
              <span>Texte auto-extrait et sauvegardé</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-600 font-bold flex-shrink-0">3.</span>
              <span>Quiz et flashcards à la demande</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-600 font-bold flex-shrink-0">4.</span>
              <span>Répétition espacée intelligente</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-600 font-bold flex-shrink-0">5.</span>
              <span>Pratique régulière = progression</span>
            </li>
          </ul>
        </div>

      </div>
    </div>
  );
}