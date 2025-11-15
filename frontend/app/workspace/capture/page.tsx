'use client';

import { useState, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Camera, Loader2, X, Check, ArrowLeft } from 'lucide-react';
import { saveCourse } from '@/lib/courseService';
import { generateQuizFromImage } from '@/lib/api';

export default function CapturePage() {
  const { user } = useUser();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('Image trop grande. Maximum 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleCapture = async () => {
    if (!selectedImage || !user) return;

    try {
      setLoading(true);
      setError(null);

      console.log('📸 Extraction du texte...');

      // Utiliser l'API quiz pour extraire le texte (1 question minimum)
      const quizData = await generateQuizFromImage(selectedImage, 1, 'easy');
      const extractedText = quizData.extractedText;

      if (!extractedText || extractedText.length < 10) {
        throw new Error('Le texte extrait est trop court ou vide');
      }

      console.log('✅ Texte extrait:', extractedText.length, 'caractères');

      // Sauvegarder le cours
      console.log('💾 Sauvegarde du cours...');
      const course = await saveCourse(user.id, extractedText);
      console.log('✅ Cours sauvegardé, ID:', course.id);

      // Rediriger vers la page du cours
      router.push(`/workspace/courses/${course.id}`);

    } catch (err: any) {
      console.error('❌ Erreur:', err);
      setError(err.message || 'Erreur lors de l\'extraction du texte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.push('/workspace')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          disabled={loading}
        >
          <ArrowLeft size={20} className="mr-2" />
          Retour au Workspace
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            📸 Capturer un Cours
          </h1>
          <p className="text-lg text-gray-600">
            Prenez une photo de votre cours pour l'extraire et le sauvegarder
          </p>
        </div>

        {/* Content */}
        {!selectedImage ? (
          // Photo Selection
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full"
            >
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-2xl p-12 transition-all duration-300 shadow-2xl hover:shadow-blue-500/50 transform hover:scale-105">
                <div className="w-24 h-24 mx-auto mb-6 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Camera size={48} className="text-white" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-2">
                  Prendre une Photo
                </h3>
                <p className="text-blue-100 text-lg">
                  Photographiez votre cours
                </p>
              </div>
            </button>

            <div className="mt-6 space-y-2 text-gray-600 text-center">
              <p className="text-sm">
                📸 <strong>Sur mobile :</strong> La caméra s'ouvrira directement
              </p>
              <p className="text-sm">
                💻 <strong>Sur ordinateur :</strong> Sélectionnez une image
              </p>
            </div>

            <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">💡 Conseils :</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>✓ Texte lisible et bien cadré</li>
                <li>✓ Bon éclairage sans reflets</li>
                <li>✓ Évitez le flou</li>
                <li>✓ Image bien centrée</li>
              </ul>
            </div>
          </div>
        ) : (
          // Image Preview + Capture
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2 text-green-600">
                <Check size={20} />
                <span className="font-medium">Photo sélectionnée</span>
              </div>
              <button
                onClick={() => {
                  setSelectedImage(null);
                  setError(null);
                }}
                className="text-gray-400 hover:text-red-600 transition-colors"
                disabled={loading}
              >
                <X size={20} />
              </button>
            </div>

            {/* Image Preview */}
            <div className="relative rounded-lg overflow-hidden border-2 border-gray-200 mb-6">
              <img
                src={selectedImage}
                alt="Course preview"
                className="w-full max-h-96 object-contain bg-gray-50"
              />
            </div>

            {/* Capture Button */}
            <button
              onClick={handleCapture}
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
                  <span>✨ Extraire et Sauvegarder</span>
                </>
              )}
            </button>

            <p className="mt-3 text-sm text-gray-500 text-center">
              💾 Le texte sera automatiquement extrait et sauvegardé
            </p>

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">❌ {error}</p>
              </div>
            )}

            {/* Progress Indicator */}
            {loading && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Loader2 className="animate-spin text-blue-600" size={20} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900">
                      Extraction en cours...
                    </p>
                    <p className="text-xs text-blue-700">
                      Lecture du texte avec l'IA
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}