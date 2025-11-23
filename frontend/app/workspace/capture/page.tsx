'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, Loader2 } from 'lucide-react';
import { saveCourse } from '@/lib/courseService';
import { extractTextFromMultipleImages } from '@/lib/api';
import MultiImageCapture from '@/components/workspace/MultiImageCapture';
import LoadingFeedback from '@/components/workspace/LoadingFeedback';
// 👇 IMPORT CRUCIAL POUR L'XP
import { addXp } from '@/lib/gamificationService';

export default function CapturePage() {
  const { user } = useUser();
  const router = useRouter();

  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState<string>('uploading');
  const [error, setError] = useState<string | null>(null);
  const [courseId, setCourseId] = useState<number | null>(null);

  const handleImagesSelected = (images: string[]) => {
    setSelectedImages(images);
    setError(null);
  };

  const handleExtract = async () => {
    if (!user || selectedImages.length === 0) return;

    try {
      setLoading(true);
      setError(null);

      // 1. Upload
      setLoadingStatus('uploading');
      console.log(`📸 Début...`);
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 2. Extraction
      setLoadingStatus('extracting');
      const result = await extractTextFromMultipleImages(selectedImages);
      console.log(`✅ Extraction terminée`);

      // 3. Sauvegarde
      setLoadingStatus('saving');

      // Titre auto
      const autoTitle = `Cours - ${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} (${result.totalImages} pages)`;

      const course = await saveCourse(
        user.id,
        result.extractedText,
        autoTitle
      );

      console.log('✅ Cours sauvegardé, ID:', course.id);

      // 🎉 4. GAMIFICATION : C'est ici qu'on donne l'XP !
      // On attend que la sauvegarde soit finie pour être sûr que l'user existe
      console.log("🎁 Ajout des points d'XP...");
      await addXp(user.id, 50, 'Nouveau cours créé');

      setCourseId(course.id);
      setLoadingStatus('ready');

    } catch (err: any) {
      console.error('❌ Erreur:', err);
      setError(err.message || 'Erreur lors de l\'extraction');
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    if (courseId) {
      router.push(`/workspace/courses/${courseId}`);
    } else {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 relative">
      {loading && <LoadingFeedback status={loadingStatus} onClose={handleCloseModal} />}

      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => router.push('/workspace')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          disabled={loading}
        >
          <ArrowLeft size={20} className="mr-2" />
          Retour au Workspace
        </button>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            📸 Capturer un Cours
          </h1>
          <p className="text-lg text-gray-600">
            Prenez plusieurs photos de votre cours (maximum 10 pages)
          </p>
        </div>

        {selectedImages.length === 0 ? (
          <MultiImageCapture
            onImagesSelected={handleImagesSelected}
            maxImages={10}
          />
        ) : (
          <div className="space-y-6">
            <MultiImageCapture
              onImagesSelected={handleImagesSelected}
              maxImages={10}
            />

            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <button
                onClick={handleExtract}
                disabled={loading}
                className="w-full bg-blue-600 text-white font-bold py-4 px-6 rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>Traitement en cours...</span>
                  </>
                ) : (
                  <>
                    <span>✨ Extraire et Sauvegarder ({selectedImages.length} photos)</span>
                  </>
                )}
              </button>

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">❌ {error}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}