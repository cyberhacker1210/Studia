'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles, Rocket } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Hero() {
  const { t } = useLanguage();

  return (
    <section
      id="home"
      className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-b from-primary-50 to-white"
    >
      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-700"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto section-padding text-center">
        {/* Badge */}
        <div className="inline-flex items-center space-x-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full mb-8 animate-slide-down">
          <Sparkles size={16} />
          <span className="text-sm font-medium">{t.hero.badge}</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 animate-slide-up">
          {t.hero.title}{' '}
          <span className="text-gradient">{t.hero.titleHighlight}</span>
        </h1>

        {/* Subheading */}
        <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-10 animate-slide-up animation-delay-200">
          {t.hero.subtitle}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up animation-delay-400">
          {/* Primary CTA - Workspace - MODIFIED */}
          <Link
            href="/workspace"
            className="group bg-primary-600 text-white px-8 py-4 rounded-lg hover:bg-primary-700 transition-all duration-200 font-medium shadow-xl hover:shadow-2xl flex items-center space-x-2"
          >
            <Rocket size={20} />
            <span>{t.hero.cta1}</span>
            <ArrowRight
              size={20}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>

          {/* Secondary CTA */}
          <Link
            href="#about"
            className="bg-white text-primary-600 px-8 py-4 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium border-2 border-primary-600"
          >
            {t.hero.cta2}
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
          <div className="animate-fade-in">
            <div className="text-3xl md:text-4xl font-bold text-primary-600">{t.hero.stat1Title}</div>
            <div className="text-gray-600 mt-1">{t.hero.stat1Desc}</div>
          </div>
          <div className="animate-fade-in animation-delay-200">
            <div className="text-3xl md:text-4xl font-bold text-primary-600">{t.hero.stat2Title}</div>
            <div className="text-gray-600 mt-1">{t.hero.stat2Desc}</div>
          </div>
          <div className="animate-fade-in animation-delay-400 col-span-2 md:col-span-1">
            <div className="text-3xl md:text-4xl font-bold text-primary-600">{t.hero.stat3Title}</div>
            <div className="text-gray-600 mt-1">{t.hero.stat3Desc}</div>
          </div>
        </div>
      </div>
    </section>
  );
}