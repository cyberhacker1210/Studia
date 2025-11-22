'use client';

import { useState } from 'react';
import { ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function CTA() {
  const { t, language } = useLanguage();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, language }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setStatus('success');
      setEmail('');

      setTimeout(() => {
        setStatus('idle');
      }, 5000);
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to join waitlist');

      setTimeout(() => {
        setStatus('idle');
        setErrorMessage('');
      }, 5000);
    }
  };

  return (
    <section id="waitlist" className="section-padding bg-gradient-to-br from-primary-600 to-primary-700">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
          {t.cta.title}
        </h2>
        <p className="text-lg md:text-xl text-primary-100 mb-10">
          {t.cta.subtitle}
        </p>

        {/* Waitlist Form */}
        {status !== 'success' ? (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto"
          >
            <input
              type="email"
              placeholder={t.cta.placeholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={status === 'loading'}
              className="flex-1 px-6 py-4 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-primary-300 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="group bg-white text-primary-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition-all duration-200 font-semibold flex items-center justify-center space-x-2 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{status === 'loading' ? (language === 'fr' ? 'Envoi...' : 'Sending...') : t.cta.button}</span>
              <ArrowRight
                size={20}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
          </form>
        ) : (
          <div className="flex items-center justify-center space-x-3 bg-white/10 backdrop-blur-sm text-white px-6 py-4 rounded-lg max-w-xl mx-auto">
            <CheckCircle size={24} />
            <span className="font-medium">
              {t.cta.success}
            </span>
          </div>
        )}

        {/* Error Message */}
        {status === 'error' && (
          <div className="flex items-center justify-center space-x-3 bg-red-500/20 backdrop-blur-sm text-white px-6 py-4 rounded-lg max-w-xl mx-auto mt-4">
            <AlertCircle size={24} />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        {/* Trust Indicators */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-primary-100">
          <div className="flex items-center space-x-2">
            <CheckCircle size={20} />
            <span>{t.cta.trust1}</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle size={20} />
            <span>{t.cta.trust2}</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle size={20} />
            <span>{t.cta.trust3}</span>
          </div>
        </div>
      </div>
    </section>
  );
}