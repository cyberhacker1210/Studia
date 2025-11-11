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
  Zap
} from 'lucide-react';

export default function WorkspacePage() {
  const features = [
    {
      id: 'quiz',
      title: 'Quiz Generator',
      description: 'Générez des quiz instantanément depuis vos photos de cours',
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
      id: 'flashcards',
      title: 'Flashcards AI',
      description: 'Créez des flashcards intelligentes pour mémoriser efficacement',
      icon: BrainCircuit,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      href: '/workspace/flashcards',
      status: 'coming-soon',
      badge: 'Bientôt',
      badgeColor: 'bg-purple-100 text-purple-700'
    },
    {
      id: 'notes',
      title: 'Smart Notes',
      description: 'Prenez des notes intelligentes avec suggestions automatiques',
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
      title: 'Mode Entraînement',
      description: 'Entraînez-vous avec des exercices adaptatifs personnalisés',
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
      description: 'Posez vos questions à votre assistant personnel',
      icon: Sparkles,
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50',
      textColor: 'text-pink-600',
      href: '/workspace/tutor',
      status: 'coming-soon',
      badge: 'Nouveau',
      badgeColor: 'bg-pink-100 text-pink-700'
    },
    {
      id: 'progress',
      title: 'Suivi de Progression',
      description: 'Visualisez vos progrès et statistiques détaillées',
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
    { label: 'Quiz générés', value: '0', icon: FileQuestion, color: 'text-blue-600' },
    { label: 'Heures étudiées', value: '0h', icon: Calendar, color: 'text-green-600' },
    { label: 'Score moyen', value: '0%', icon: Award, color: 'text-orange-600' },
    { label: 'Série actuelle', value: '0j', icon: Zap, color: 'text-purple-600' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Bienvenue sur Studia 👋
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Votre plateforme d'apprentissage intelligente propulsée par l'IA.
          Choisissez une fonctionnalité pour commencer.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-2">
              <stat.icon className={stat.color} size={24} />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
            <p className="text-sm text-gray-600">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Features Grid */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Fonctionnalités
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            const isAvailable = feature.status === 'available';

            const CardContent = (
              <>
                {/* Icon with gradient background */}
                <div className={`${feature.bgColor} w-16 h-16 rounded-2xl flex items-center justify-center mb-4`}>
                  <Icon className={feature.textColor} size={32} />
                </div>

                {/* Badge */}
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${feature.badgeColor}`}>
                    {feature.badge}
                  </span>
                  {isAvailable && (
                    <ChevronRight className="text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" size={20} />
                  )}
                </div>

                {/* Title & Description */}
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>

                {/* Status indicator */}
                {!isAvailable && (
                  <div className="mt-4 text-xs text-gray-500 flex items-center space-x-1">
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    <span>Disponible prochainement</span>
                  </div>
                )}
              </>
            );

            return isAvailable ? (
              <Link
                key={feature.id}
                href={feature.href}
                className="group bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer"
              >
                {CardContent}
              </Link>
            ) : (
              <div
                key={feature.id}
                className="group bg-white rounded-2xl shadow-lg border border-gray-100 p-6 opacity-60 cursor-not-allowed"
              >
                {CardContent}
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Start CTA */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-xl p-8 text-white">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-6 md:mb-0">
            <h3 className="text-2xl font-bold mb-2">
              Prêt à commencer ? 🚀
            </h3>
            <p className="text-blue-100">
              Générez votre premier quiz en moins d'une minute !
            </p>
          </div>
          <Link
            href="/workspace/quiz"
            className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold hover:bg-blue-50 transition-all transform hover:scale-105 shadow-lg flex items-center space-x-2"
          >
            <FileQuestion size={20} />
            <span>Créer un Quiz</span>
            <ChevronRight size={20} />
          </Link>
        </div>
      </div>

      {/* Tips Section */}
      <div className="mt-12 bg-blue-50 border border-blue-100 rounded-2xl p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
          <Sparkles className="text-blue-600" size={24} />
          <span>💡 Astuces pour bien démarrer</span>
        </h3>
        <ul className="space-y-3 text-gray-700">
          <li className="flex items-start space-x-3">
            <span className="text-blue-600 font-bold">1.</span>
            <span>Prenez des photos claires et bien éclairées de vos cours</span>
          </li>
          <li className="flex items-start space-x-3">
            <span className="text-blue-600 font-bold">2.</span>
            <span>Commencez avec 5 questions en difficulté moyenne</span>
          </li>
          <li className="flex items-start space-x-3">
            <span className="text-blue-600 font-bold">3.</span>
            <span>Utilisez les explications pour approfondir vos connaissances</span>
          </li>
          <li className="flex items-start space-x-3">
            <span className="text-blue-600 font-bold">4.</span>
            <span>Pratiquez régulièrement pour de meilleurs résultats</span>
          </li>
        </ul>
      </div>
    </div>
  );
}