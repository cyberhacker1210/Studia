'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, UploadCloud, Layers, Sparkles } from 'lucide-react';
import { saveCourse } from '@/lib/courseService';
import { extractTextFromMultipleImages } from '@/lib/api';
import MultiImageCapture from '@/components/workspace/MultiImageCapture';
import { addXp } from '@/lib/gamificationService';

export default function CapturePage() {
  const { user } = useUser();
  const router = useRouter();
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImagesSelected = (images: string[]) => {
    setSelectedImages(images);
    setError(null);
  };

  const handleExtract = async () => {
    if (!user || selectedImages.length === 0) return;
    try {
      setLoading(true);
      setError(null);
      // Simulation UX
      await new Promise(resolve => setTimeout(resolve, 800));

      const result = await extractTextFromMultipleImages(selectedImages);
      const autoTitle = `Cours du ${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}`;
      const course = await saveCourse(user.id, result.extractedText, autoTitle);
      await addXp(user.id, 50, 'Nouveau cours créé');
      router.push(`/workspace/courses/${course.id}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erreur d'analyse");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6 animate-in fade-in slide-in-from-bottom-4">

        <button onClick={() => router.push('/workspace')} className="flex items-center gap-2 text-slate-500 font-bold text-sm hover:text-slate-900 mb-8 transition-colors">
            <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center"><ArrowLeft size={16}/></div>
            Retour
        </button>

        <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
                <Sparkles size={12} /> IA Générative
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Numériser un cours</h1>
            <p className="text-slate-500 font-medium">Prenez des photos claires pour un meilleur résultat.</p>
        </div>

        <div className="bg-white border-2 border-slate-100 rounded-[2rem] p-8 shadow-sm">
             <MultiImageCapture
                onImagesSelected={handleImagesSelected}
                maxImages={10}
             />

             {selectedImages.length > 0 && (
                <div className="mt-8 pt-6 border-t-2 border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in">
                    <div className="flex items-center gap-2 text-slate-600 font-bold text-sm bg-slate-50 px-4 py-2 rounded-xl">
                        <Layers size={18} className="text-blue-600"/> {selectedImages.length} images
                    </div>

                    <button
                        onClick={handleExtract}
                        disabled={loading}
                        className="btn-b-primary w-full sm:w-auto min-w-[200px]"
                    >
                        {loading ? <Loader2 className="animate-spin"/> : <UploadCloud />}
                        {loading ? 'Analyse...' : 'Générer le Cours'}
                    </button>
                </div>
             )}
        </div>

        {error && (
            <div className="mt-6 p-4 bg-red-50 border-2 border-red-100 text-red-600 rounded-2xl font-bold text-center text-sm">
                {error}
            </div>
        )}
    </div>
  );
}