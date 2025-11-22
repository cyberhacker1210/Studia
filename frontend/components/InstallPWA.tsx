'use client';

import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    // Écouter l'événement beforeinstallprompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);

      // Vérifier si déjà installé ou si l'utilisateur a refusé
      const hasDeclined = localStorage.getItem('pwa-install-declined');
      const isInstalled = window.matchMedia('(display-mode: standalone)').matches;

      if (!hasDeclined && !isInstalled) {
        // Attendre 10 secondes avant d'afficher
        setTimeout(() => {
          setShowInstallPrompt(true);
        }, 10000);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Détecter si déjà installé
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('✅ App déjà installée');
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Afficher le prompt d'installation
    deferredPrompt.prompt();

    // Attendre le choix de l'utilisateur
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User choice: ${outcome}`);

    if (outcome === 'accepted') {
      console.log('✅ App installée');
    } else {
      console.log('❌ Installation refusée');
      localStorage.setItem('pwa-install-declined', 'true');
    }

    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    localStorage.setItem('pwa-install-declined', 'true');
  };

  if (!showInstallPrompt) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-slide-up">
      <div className="max-w-md mx-auto bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-6 text-gray-900 relative">
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 text-gray-900/80 hover:text-white"
          >
            <X size={20} />
          </button>

          <div className="flex items-start space-x-4 pr-8">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Download size={24} />
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-bold mb-1">
                📱 Installer Studia
              </h3>
              <p className="text-sm text-blue-100 mb-4">
                Installez l'app pour un accès rapide et une expérience optimale
              </p>

              <div className="flex gap-3">
                <button
                  onClick={handleInstallClick}
                  className="px-6 py-2.5 bg-white text-blue-600 rounded-lg font-bold hover:bg-blue-50 transition-all active:scale-95"
                >
                  Installer
                </button>
                <button
                  onClick={handleDismiss}
                  className="px-6 py-2.5 bg-white/20 text-gray-900 rounded-lg font-semibold hover:bg-white/30 transition-all active:scale-95"
                >
                  Plus tard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}