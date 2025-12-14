'use client';

import { useState, useEffect } from 'react';
import { Download, X, Share, PlusSquare } from 'lucide-react';

export default function InstallPWA() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 1. Détection iOS (iPhone/iPad et pas déjà installé)
    const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    // @ts-ignore
    const isStandalone = window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;

    if (isIosDevice && !isStandalone) {
        setIsIOS(true);
        // On affiche la bannière iOS si elle n'a pas été fermée dans cette session
        if (!sessionStorage.getItem('pwa-ios-dismissed')) {
            setShowBanner(true);
        }
    }

    // 2. Détection Android / Chrome (Standard)
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
      // On affiche si pas déjà installé ou refusé définitivement
      if (!localStorage.getItem('pwa-dismissed')) {
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
    if (isIOS) {
        sessionStorage.setItem('pwa-ios-dismissed', 'true'); // Rappel à la prochaine session
    } else {
        localStorage.setItem('pwa-dismissed', 'true'); // Ne plus jamais demander
    }
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 animate-in slide-in-from-bottom duration-500 md:left-auto md:right-8 md:w-96 md:bottom-8">
      <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-2xl border border-slate-700 relative overflow-hidden">

        {/* Glow Effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full blur-[60px] opacity-20 -mr-10 -mt-10"></div>

        {/* Close Button */}
        <button onClick={handleDismiss} className="absolute top-3 right-3 text-slate-400 hover:text-white transition-colors p-1">
            <X size={18} />
        </button>

        <div className="flex items-start gap-4 mb-4 pr-6">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/10 shrink-0">
                <Download size={24} />
            </div>
            <div>
                <h3 className="font-bold text-lg leading-tight">Installer l'app</h3>
                <p className="text-slate-300 text-sm leading-tight mt-1">
                    {isIOS ? "Pour une meilleure expérience." : "Accès rapide et hors-ligne."}
                </p>
            </div>
        </div>

        {isIOS ? (
            // INSTRUCTIONS SPÉCIFIQUES IOS
            <div className="text-sm text-slate-200 bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                <div className="flex items-center gap-2 mb-2">
                    1. Appuyez sur <Share size={16} className="text-blue-400"/> <strong>Partager</strong>
                </div>
                <div className="flex items-center gap-2">
                    2. Sélectionnez <PlusSquare size={16} className="text-slate-400"/> <strong>Sur l'écran d'accueil</strong>
                </div>
            </div>
        ) : (
            // BOUTON STANDARD ANDROID
            <button
                onClick={handleInstall}
                className="w-full bg-white text-slate-900 font-bold py-3 rounded-xl hover:bg-blue-50 transition-colors active:scale-95 shadow-lg flex items-center justify-center gap-2"
            >
                Installer maintenant
            </button>
        )}
      </div>
    </div>
  );
}