'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, UploadCloud, Layers, Sparkles, X, Check, Bot, ArrowRight, Zap } from 'lucide-react';
import { saveCourse } from '@/lib/courseService';
import { extractTextFromMultipleImages } from '@/lib/api';
import { addXp } from '@/lib/gamificationService';
import MultiImageCapture from '@/components/workspace/MultiImageCapture';
// 👇 Import du Hook Énergie
import { useEnergy } from '@/hooks/useEnergy';

export default function CapturePage() {
  const { user } = useUser();
  const router = useRouter();

  // 👇 Initialisation du Hook
  const { consumeEnergy, isPremium } = useEnergy();

  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'upload' | 'processing' | 'success'>('upload');
  const [error, setError] = useState<string | null>(null);
  const [courseId, setCourseId] = useState<number | null>(null);

  const handleImagesSelected = (images: string[]) => {
    setSelectedImages(images);
    setError(null);
  };

  const handleExtract = async () => {
    if (!user || selectedImages.length === 0) return;

    // 🛑 VÉRIFICATION ÉNERGIE (Coût: 2)
    const canProceed = await consumeEnergy(2);

    if (!canProceed) {
        if(confirm("⚡️ Pas assez d'énergie !\n\nIl vous faut 2 éclairs pour numériser un cours complet.\nRevenez demain ou passez Premium pour l'illimité.")) {
            router.push('/workspace/pricing');
        }
        return;
    }

    try {
      setLoading(true);
      setStep('processing');
      setError(null);

      // Simulation UX
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Extraction
      const result = await extractTextFromMultipleImages(selectedImages);

      // Sauvegarde
      const autoTitle = `Cours du ${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}`;
      const course = await saveCourse(user.id, result.extractedText, autoTitle);

      // Gamification
      await addXp(user.id, 50, 'Nouveau cours créé');

      setCourseId(course.id);
      setStep('success');

    } catch (err: any) {
      console.error('Erreur:', err);
      setError(err.message || "Une erreur est survenue lors de l'analyse.");
      setStep('upload');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-6 pb-32">

        {/* Navigation Retour */}
        {step === 'upload' && (
            <button
              onClick={() => router.push('/workspace')}
              className="group flex items-center gap-3 text-slate-500 hover:text-slate-900 mb-12 font-bold text-sm transition-colors w-fit"
            >
              <div className="w-10 h-10 rounded-full border-2 border-slate-100 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all bg-slate-50">
                  <ArrowLeft size={18} />
              </div>
              Annuler
            </button>
        )}

        {/* ÉTAPE 1 : UPLOAD */}
        {step === 'upload' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6 border border-blue-100 shadow-sm">
                        <Sparkles size={12} /> IA Vision
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-4 tracking-tight">
                        Numériser un cours
                    </h1>
                    <p className="text-xl text-slate-500 font-medium max-w-lg mx-auto leading-relaxed">
                        Prenez vos notes en photo. Je m'occupe de les lire, les trier et les transformer en quiz.
                    </p>
                </div>

                <div className="bg-white border-2 border-slate-100 rounded-[3rem] p-8 md:p-12 shadow-xl shadow-slate-200/50 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-50 to-purple-50 rounded-bl-[15rem] -z-0 opacity-40 pointer-events-none"></div>

                    <div className="relative z-10">
                        <MultiImageCapture
                            onImagesSelected={handleImagesSelected}
                            maxImages={10}
                        />

                        {/* ACTION BAR */}
                        {selectedImages.length > 0 && (
                            <div className="mt-12 pt-8 border-t-2 border-slate-50 flex flex-col md:flex-row items-center justify-between gap-6 animate-in slide-in-from-bottom-4">
                                <div className="flex items-center gap-4 bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100">
                                    <div className="relative">
                                        <Layers size={24} className="text-blue-600" />
                                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                                            {selectedImages.length}
                                        </span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-slate-900">Pages prêtes</span>
                                        <span className="text-xs font-medium text-slate-500">Max 10 pages</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleExtract}
                                    disabled={loading}
                                    className="btn-b-primary w-full md:w-auto text-lg px-10 py-4 shadow-xl shadow-blue-200 hover:shadow-blue-300 min-w-[200px] flex items-center justify-center gap-2"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={24}/> : <UploadCloud size={24} />}
                                    <span>
                                        {loading ? 'Analyse...' : 'Générer le Cours'}
                                    </span>
                                    {/* Affichage du coût en énergie */}
                                    {!isPremium && !loading && (
                                        <span className="ml-2 text-xs bg-slate-800 text-yellow-400 px-2 py-0.5 rounded-full font-bold">
                                            -2 ⚡️
                                        </span>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="mt-8 mx-auto max-w-md bg-red-50 text-red-600 px-6 py-4 rounded-2xl font-bold text-center border-2 border-red-100 flex items-center justify-center gap-3 animate-in zoom-in shadow-sm">
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <X size={16} strokeWidth={3} />
                        </div>
                        {error}
                    </div>
                )}
            </div>
        )}

        {/* ÉTAPE 2 : TRAITEMENT */}
        {step === 'processing' && (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-in fade-in duration-700">
                <div className="relative w-40 h-40 mb-10">
                    <div className="absolute inset-0 border-[6px] border-slate-100 rounded-full"></div>
                    <div className="absolute inset-0 border-[6px] border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                    <div className="absolute inset-4 border-[6px] border-purple-100 rounded-full border-t-transparent animate-spin-slow reverse"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Bot size={56} className="text-slate-900 animate-bounce" />
                    </div>
                </div>

                <h2 className="text-4xl font-black text-slate-900 mb-4">Analyse en cours...</h2>

                <div className="bg-slate-50 px-8 py-6 rounded-2xl border border-slate-100 max-w-sm mx-auto">
                    <div className="space-y-3 text-slate-500 font-bold text-sm text-left">
                        <p className="flex items-center gap-3 animate-pulse">
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span> Lecture du texte manuscrit
                        </p>
                        <p className="flex items-center gap-3 animate-pulse delay-100">
                            <span className="w-2 h-2 bg-purple-500 rounded-full"></span> Structuration des chapitres
                        </p>
                        <p className="flex items-center gap-3 animate-pulse delay-200">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span> Génération du résumé
                        </p>
                    </div>
                </div>
            </div>
        )}

        {/* ÉTAPE 3 : SUCCÈS */}
        {step === 'success' && (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-in zoom-in duration-500">
                <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center mb-10 shadow-2xl shadow-green-100 relative">
                    <Check size={64} strokeWidth={4} className="text-green-600" />
                    <div className="absolute -right-4 -top-4 bg-yellow-400 text-slate-900 text-sm font-black px-4 py-1.5 rounded-full border-4 border-white shadow-md animate-bounce">
                        +50 XP
                    </div>
                </div>

                <h2 className="text-5xl font-black text-slate-900 mb-6">C'est prêt !</h2>
                <p className="text-xl text-slate-500 font-medium mb-12 max-w-md mx-auto leading-relaxed">
                    Votre cours a été numérisé et sauvegardé avec succès.
                </p>

                <button
                    onClick={() => router.push(`/workspace/courses/${courseId}`)}
                    className="btn-b-primary text-xl px-12 py-5 shadow-2xl hover:shadow-blue-500/30"
                >
                    Voir mon cours <ArrowRight className="ml-2" strokeWidth={3} />
                </button>
            </div>
        )}
    </div>
  );
}