'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, Check } from 'lucide-react';
import { saveCourse } from '@/lib/courseService';
import { extractTextFromMultipleImages } from '@/lib/api';
import MultiImageCapture from '@/components/workspace/MultiImageCapture';

export default function CapturePage() {
  const { user } = useUser();
  const router = useRouter();

  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleImagesSelected = (images: string[]) => {
    setSelectedImages(images);
    setError(null);
  };

  const handleExtract = async () => {
    if (!user || selectedImages.length === 0) return;

    try {
      setLoading(true);
      setError(null);

      console.log(`📸 Extraction de ${selectedImages.length} images...`);

      const result = await extractTextFromMultipleImages(selectedImages);

      console.log(`✅ ${result.pagesExtracted} pages extraites`);

      // Sauvegarder le cours
      const course = await saveCourse(
        user.id,
        result.extractedText,
        `Cours - ${result.totalImages} pages - ${new Date().toLocaleDateString('fr-FR')}`
      );

      console.log('✅ Cours sauvegardé, ID:', course.id);

      setSuccess(true);

      // Rediriger après 2 secondes
      setTimeout(() => {
        router.push(`/workspace/courses/${course.id}`);
      }, 2000);

    } catch (err: any) {
      console.error('❌ Erreur:', err);
      setError(err.message || 'Erreur lors de l\'extraction');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="text-green-600" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            ✅ Cours Sauvegardé !
          </h2>
          <p className="text-gray-600">
            Redirection vers votre cours...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
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
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
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
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>Extraction en cours...</span>
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

              {loading && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Loader2 className="animate-spin text-blue-600" size={20} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900">
                        Extraction en cours...
                      </p>
                      <p className="text-xs text-blue-700">
                        Traitement de {selectedImages.length} images avec OCR
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}