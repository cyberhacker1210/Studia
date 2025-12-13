'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Sparkles, Check, Book, Tag } from 'lucide-react';
import { saveCourse } from '@/lib/courseService';
import { extractTextFromMultipleImages } from '@/lib/api';
import { addXp } from '@/lib/gamificationService';
import MultiImageCapture from '@/components/workspace/MultiImageCapture';
import { useEnergy } from '@/hooks/useEnergy';

const SUBJECTS = [
  "Mathématiques", "Physique-Chimie", "SVT", "Histoire-Géo",
  "Philosophie", "Français", "Anglais", "Espagnol", "SES", "NSI", "Autre"
];

export default function CapturePage() {
  const { user } = useUser();
  const router = useRouter();
  const { consumeEnergy } = useEnergy();

  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const [courseTitle, setCourseTitle] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');

  const [step, setStep] = useState<'form' | 'upload' | 'processing' | 'success'>('form');
  const [error, setError] = useState<string | null>(null);
  const [courseId, setCourseId] = useState<number | null>(null);

  const handleFormSubmit = () => {
      if (!courseTitle.trim() || !selectedSubject) return;
      setStep('upload');
  };

  const handleExtract = async () => {
    if (!user || selectedImages.length === 0) return;

    const canProceed = await consumeEnergy(2);
    if (!canProceed) {
        router.push('/workspace/pricing');
        return;
    }

    try {
      setLoading(true);
      setStep('processing');
      setError(null);

      const result = await extractTextFromMultipleImages(selectedImages);
      const course = await saveCourse(user.id, result.extractedText, courseTitle, selectedSubject);

      await addXp(user.id, 50, 'Nouveau cours créé');
      setCourseId(course.id);
      setStep('success');

    } catch (err: any) {
      console.error('Erreur:', err);
      setError(err.message);
      setStep('upload');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-6 pb-32">
        {step !== 'processing' && (
            <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 font-bold mb-8 hover:text-slate-900 transition-colors">
                <ArrowLeft size={18}/> Annuler
            </button>
        )}

        {/* ÉTAPE 1 : MATIÈRE */}
        {step === 'form' && (
            <div className="animate-in fade-in slide-in-from-bottom-4">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-black text-slate-900 mb-2">Quel est ce cours ?</h1>
                    <p className="text-slate-500">Pour activer la méthodologie 20/20 adaptée.</p>
                </div>

                <div className="bg-white border-2 border-slate-100 rounded-[2rem] p-8 shadow-sm space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                            <Book size={16}/> Titre du chapitre
                        </label>
                        <input
                            type="text" placeholder="Ex: La Guerre Froide"
                            className="w-full p-4 rounded-xl bg-slate-50 border-2 border-slate-100 focus:border-slate-900 outline-none font-bold text-lg"
                            value={courseTitle} onChange={(e) => setCourseTitle(e.target.value)} autoFocus
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                            <Tag size={16}/> Matière
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {SUBJECTS.map(sub => (
                                <button
                                    key={sub} onClick={() => setSelectedSubject(sub)}
                                    className={`py-3 px-2 rounded-xl text-sm font-bold transition-all border-2 ${
                                        selectedSubject === sub 
                                        ? 'bg-slate-900 text-white border-slate-900 shadow-md transform scale-105' 
                                        : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300'
                                    }`}
                                >
                                    {sub}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button onClick={handleFormSubmit} disabled={!courseTitle || !selectedSubject} className="btn-b-primary w-full py-4 text-lg mt-4 disabled:opacity-50">
                        Continuer
                    </button>
                </div>
            </div>
        )}

        {/* ÉTAPE 2 : UPLOAD */}
        {step === 'upload' && (
            <div className="animate-in slide-in-from-right-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900">{courseTitle}</h2>
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase">{selectedSubject}</span>
                    </div>
                </div>
                <div className="bg-white border-2 border-slate-100 rounded-[2rem] p-6 shadow-sm">
                    <MultiImageCapture onImagesSelected={setSelectedImages} maxImages={10} />
                    {selectedImages.length > 0 && (
                        <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                            <button onClick={handleExtract} disabled={loading} className="btn-b-primary px-8 py-3 text-lg flex items-center gap-2">
                                {loading ? <Loader2 className="animate-spin"/> : <Sparkles size={20} fill="currentColor"/>}
                                {loading ? 'Analyse...' : 'Générer'}
                            </button>
                        </div>
                    )}
                </div>
                {error && <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl font-bold text-center border-2 border-red-100">{error}</div>}
            </div>
        )}

        {/* ÉTAPE 3 : PROCESSING */}
        {step === 'processing' && (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center animate-in fade-in">
                <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-6" />
                <h2 className="text-2xl font-black text-slate-900 mb-2">Analyse Méthodique...</h2>
                <p className="text-slate-500 font-medium">Application de la stratégie <strong className="text-blue-600">{selectedSubject}</strong>.</p>
            </div>
        )}

        {/* ÉTAPE 4 : SUCCESS */}
        {step === 'success' && (
            <div className="text-center py-20 animate-in zoom-in">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 text-green-600 shadow-xl">
                    <Check size={48} strokeWidth={4} />
                </div>
                <h1 className="text-4xl font-black text-slate-900 mb-4">Cours Prêt !</h1>
                <p className="text-slate-500 mb-10">Prêt pour la révision active.</p>
                <button onClick={() => router.push(`/workspace/courses/${courseId}`)} className="btn-b-primary px-12 py-4 text-lg">
                    Accéder au cours
                </button>
            </div>
        )}
    </div>
  );
}