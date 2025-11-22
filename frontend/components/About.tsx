'use client';

import { BookOpen, Target, Zap } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function About() {
  const { t } = useLanguage();

  return (
    <section id="about" className="section-padding bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            {t.about.title} <span className="text-gradient">{t.about.titleHighlight}</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t.about.subtitle}
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="group bg-gradient-to-br from-primary-50 to-white p-8 rounded-2xl hover:shadow-xl transition-all duration-300 border border-primary-100">
            <div className="w-14 h-14 bg-primary-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <BookOpen className="text-gray-900" size={28} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {t.about.mission}
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {t.about.missionDesc}
            </p>
          </div>

          {/* Card 2 */}
          <div className="group bg-gradient-to-br from-primary-50 to-white p-8 rounded-2xl hover:shadow-xl transition-all duration-300 border border-primary-100">
            <div className="w-14 h-14 bg-primary-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Target className="text-gray-900" size={28} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {t.about.vision}
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {t.about.visionDesc}
            </p>
          </div>

          {/* Card 3 */}
          <div className="group bg-gradient-to-br from-primary-50 to-white p-8 rounded-2xl hover:shadow-xl transition-all duration-300 border border-primary-100">
            <div className="w-14 h-14 bg-primary-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Zap className="text-gray-900" size={28} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {t.about.approach}
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {t.about.approachDesc}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}