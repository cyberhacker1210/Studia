'use client';

import { Check } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function WhyStudia() {
  const { t } = useLanguage();

  const benefits = [
    {
      title: t.why.benefit1,
      description: t.why.benefit1Desc,
    },
    {
      title: t.why.benefit2,
      description: t.why.benefit2Desc,
    },
    {
      title: t.why.benefit3,
      description: t.why.benefit3Desc,
    },
    {
      title: t.why.benefit4,
      description: t.why.benefit4Desc,
    },
    {
      title: t.why.benefit5,
      description: t.why.benefit5Desc,
    },
    {
      title: t.why.benefit6,
      description: t.why.benefit6Desc,
    },
  ];

  return (
    <section id="why" className="section-padding bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              {t.why.title} <span className="text-gradient">{t.why.titleHighlight}</span>
            </h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              {t.why.subtitle}
            </p>
            <div className="space-y-4">
              {benefits.slice(0, 3).map((benefit, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Check size={16} className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {benefit.title}
                    </h4>
                    <p className="text-gray-600 text-sm">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content */}
          <div className="space-y-4">
            {benefits.slice(3).map((benefit, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-primary-50 to-white p-6 rounded-xl border border-primary-100 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Check size={16} className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {benefit.title}
                    </h4>
                    <p className="text-gray-600 text-sm">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}