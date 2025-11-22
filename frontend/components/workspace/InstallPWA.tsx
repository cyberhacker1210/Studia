'use client';

import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export default function InstallPWA() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);

      // Show banner if not dismissed
      const dismissed = localStorage.getItem('pwa-banner-dismissed');
      if (!dismissed) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;

    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('✅ PWA installée');
    }

    setInstallPrompt(null);
    setShowBanner(false);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('pwa-banner-dismissed', 'true');
  };

  if (!showBanner || !installPrompt) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-96 z-50 animate-slide-up">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-2xl p-6 text-white">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Download size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg">Installer Studia</h3>
              <p className="text-sm text-blue-100">Accès rapide + Mode Offline</p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-900/80 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <button
          onClick={handleInstall}
          className="w-full bg-white text-blue-600 font-semibold py-3 px-6 rounded-xl hover:bg-blue-50 transition-all transform hover:scale-105"
        >
          📲 Installer l'app
        </button>

        <p className="mt-3 text-xs text-blue-100 text-center">
          Utilisez Studia comme une app native
        </p>
      </div>
    </div>
  );
}