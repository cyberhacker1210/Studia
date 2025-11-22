'use client';

import Link from 'next/link';
import { Sparkles, Rocket, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Hero() {
  const { t } = useLanguage();

  return (
    <section
      id="home"
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 pt-20"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 py-20 text-center">
        {/* Badge */}
        <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full mb-8">
          <Sparkles size={16} />
          <span className="text-sm font-medium">{t.hero.badge}</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
          {t.hero.title}{' '}
          <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
            {t.hero.titleHighlight}
          </span>
        </h1>

        {/* Subheading */}
        <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-10">
          {t.hero.subtitle}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/workspace"
            className="group bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium shadow-xl hover:shadow-2xl flex items-center space-x-2"
          >
            <Rocket size={20} />
            <span>{t.hero.cta1}</span>
            <ArrowRight
              size={20}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>

          <Link
            href="#about"
            className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium border-2 border-blue-600"
          >
            {t.hero.cta2}
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
          <div>
            <div className="text-3xl md:text-4xl font-bold text-blue-600">
              {t.hero.stat1Title}
            </div>
            <div className="text-gray-600 mt-1">{t.hero.stat1Desc}</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-blue-600">
              {t.hero.stat2Title}
            </div>
            <div className="text-gray-600 mt-1">{t.hero.stat2Desc}</div>
          </div>
          <div className="col-span-2 md:col-span-1">
            <div className="text-3xl md:text-4xl font-bold text-blue-600">
              {t.hero.stat3Title}
            </div>
            <div className="text-gray-600 mt-1">{t.hero.stat3Desc}</div>
          </div>
        </div>
      </div>
    </section>
  );
}