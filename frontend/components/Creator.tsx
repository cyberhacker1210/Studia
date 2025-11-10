'use client';

import { Github, Mail } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Creator() {
  const { t } = useLanguage();

  return (
    <section id="creator" className="section-padding bg-gradient-to-b from-primary-50 to-white">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            {t.creator.title} <span className="text-gradient">{t.creator.titleHighlight}</span>
          </h2>
          <p className="text-lg text-gray-600">
            {t.creator.subtitle}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-primary-100">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Avatar */}
            <div className="w-32 h-32 bg-gradient-to-br from-primary-600 to-primary-400 rounded-full flex items-center justify-center text-white text-5xl font-bold flex-shrink-0">
              DL
            </div>

            {/* Content */}
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                Daniel Leo
              </h3>
              <p className="text-primary-600 font-medium mb-4">
                {t.creator.role}
              </p>
              <p className="text-gray-600 leading-relaxed mb-6">
                {t.creator.bio}
              </p>

              {/* Social Links */}
              <div className="flex items-center justify-center md:justify-start space-x-4">
                <Link
                  href="https://github.com/cyberhacker1210"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-900 text-white rounded-lg flex items-center justify-center hover:bg-gray-800 transition-colors"
                >
                  <Github size={20} />
                </Link>
                <Link
                  href="mailto:contact@studia.com"
                  className="w-10 h-10 bg-primary-600 text-white rounded-lg flex items-center justify-center hover:bg-primary-700 transition-colors"
                >
                  <Mail size={20} />
                </Link>
              </div>
            </div>
          </div>

          {/* Quote */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <blockquote className="text-center italic text-gray-700 text-lg">
              {t.creator.quote}
            </blockquote>
          </div>
        </div>
      </div>
    </section>
  );
}