'use client';

import { Brain, FileText, Lightbulb, Repeat, Sparkles, TrendingUp } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Features() {
  const { t } = useLanguage();

  const features = [
    {
      icon: <Brain size={28} />,
      title: t.features.feature1,
      description: t.features.feature1Desc,
    },
    {
      icon: <FileText size={28} />,
      title: t.features.feature2,
      description: t.features.feature2Desc,
    },
    {
      icon: <Repeat size={28} />,
      title: t.features.feature3,
      description: t.features.feature3Desc,
    },
    {
      icon: <TrendingUp size={28} />,
      title: t.features.feature4,
      description: t.features.feature4Desc,
    },
    {
      icon: <Lightbulb size={28} />,
      title: t.features.feature5,
      description: t.features.feature5Desc,
    },
    {
      icon: <Sparkles size={28} />,
      title: t.features.feature6,
      description: t.features.feature6Desc,
    },
  ];

  return (
    <section id="features" className="section-padding bg-gradient-to-b from-white to-primary-50">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            {t.features.title} <span className="text-gradient">{t.features.titleHighlight}</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t.features.subtitle}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-white p-8 rounded-2xl hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-primary-200"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-primary-600 to-primary-400 rounded-xl flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}