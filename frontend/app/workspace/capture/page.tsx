'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, Loader2 } from 'lucide-react';
import { saveCourse } from '@/lib/courseService';
import { extractTextFromMultipleImages } from '@/lib/api';
import MultiImageCapture from '@/components/workspace/MultiImageCapture';
import LoadingFeedback from '@/components/workspace/LoadingFeedback';

export default function CapturePage() {
  const { user } = useUser();
  const router = useRouter();

  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState<string>('uploading'); // 'uploading', 'extracting', 'saving', 'ready'
  const [error, setError] = useState<string | null>(null);
  const [courseId, setCourseId] = useState<number | null>(null);

  const handleImagesSelected = (images: string[]) => {
    setSelectedImages(images);
    setError(null);
  };

  const handleExtract = async () => {
    if (!user || selectedImages.length === 0) return;

    try {
      // 1. Activer la modal de chargement
      setLoading(true);
      setError(null);

      // Étape 1 : Upload (Simulation visuelle)
      setLoadingStatus('uploading');
      console.log(`📸 Début de l'extraction pour ${selectedImages.length} images...`);

      // Petite pause pour laisser le temps à l'utilisateur de comprendre ce qu'il se passe
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Étape 2 : Extraction IA
      setLoadingStatus('extracting');
      const result = await extractTextFromMultipleImages(selectedImages);
      console.log(`✅ ${result.pagesExtracted} pages extraites`);

      // Étape 3 : Sauvegarde
      setLoadingStatus('saving');
      const course = await saveCourse(
        user.id,
        result.extractedText,
        `Cours - ${result.totalImages} pages - ${new Date().toLocaleDateString('fr-FR')}`
      );

      console.log('✅ Cours sauvegardé, ID:', course.id);

      // Étape 4 : Prêt ! On ne redirige PAS automatiquement.
      setCourseId(course.id);
      setLoadingStatus('ready'); // Cela fera apparaître le bouton "Accéder au cours" dans la modal

    } catch (err: any) {
      console.error('❌ Erreur:', err);
      setError(err.message || 'Erreur lors de l\'extraction');
      setLoading(false); // En cas d'erreur, on ferme la modal pour montrer le message d'erreur
    }
  };

  // Fonction appelée quand l'utilisateur clique sur "Accéder à mon cours" dans la modal
  const handleCloseModal = () => {
    if (courseId) {
      router.push(`/workspace/courses/${courseId}`);
    } else {
      setLoading(false); // Sécurité
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 relative">

      {/* MODAL D'AVIS & CHARGEMENT */}
      {loading && (
        <LoadingFeedback
          status={loadingStatus}
          onClose={handleCloseModal}
        />
      )}

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