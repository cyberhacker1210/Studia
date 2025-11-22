'use client';

import { useState, useRef } from 'react';
import { Camera, Image as ImageIcon, X, Upload } from 'lucide-react';

interface MultiImageCaptureProps {
  onImagesSelected: (images: string[]) => void;
  maxImages?: number;
}

export default function MultiImageCapture({
  onImagesSelected,
  maxImages = 10
}: MultiImageCaptureProps) {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelection = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newImages: string[] = [];

    // Limite au nombre d'images restantes
    const remainingSlots = maxImages - selectedImages.length;
    const filesToProcess = Math.min(files.length, remainingSlots);

    for (let i = 0; i < filesToProcess; i++) {
      const file = files[i];

      // Vérifier que c'est bien une image
      if (!file.type.startsWith('image/')) {
        continue;
      }

      // Convertir en base64
      const base64 = await fileToBase64(file);
      newImages.push(base64);
    }

    const updatedImages = [...selectedImages, ...newImages];
    setSelectedImages(updatedImages);
    onImagesSelected(updatedImages);

    // Avertir si limite atteinte
    if (updatedImages.length >= maxImages) {
      alert(`Maximum de ${maxImages} photos atteint !`);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    const updatedImages = selectedImages.filter((_, i) => i !== index);
    setSelectedImages(updatedImages);
    onImagesSelected(updatedImages);
  };

  const handleCameraClick = () => {
    cameraInputRef.current?.click();
  };

  const handleGalleryClick = () => {
    galleryInputRef.current?.click();
  };

  const canAddMore = selectedImages.length < maxImages;

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      {canAddMore && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Bouton Caméra (Mobile) */}
          <button
            type="button"
            onClick={handleCameraClick}
            className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95"
          >
            <Camera size={48} className="mb-3" />
            <span className="text-lg font-bold">Prendre une photo</span>
            <span className="text-sm opacity-90 mt-1">Utiliser la caméra</span>
          </button>

          {/* Bouton Galerie */}
          <button
            type="button"
            onClick={handleGalleryClick}
            className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95"
          >
            <ImageIcon size={48} className="mb-3" />
            <span className="text-lg font-bold">Choisir des photos</span>
            <span className="text-sm opacity-90 mt-1">Depuis la galerie</span>
          </button>

          {/* Hidden inputs */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            onChange={(e) => handleImageSelection(e.target.files)}
            className="hidden"
          />

          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleImageSelection(e.target.files)}
            className="hidden"
          />
        </div>
      )}

      {/* Counter */}
      <div className="text-center">
        <div className={`inline-flex items-center px-6 py-3 rounded-full font-bold text-lg ${
          selectedImages.length >= maxImages 
            ? 'bg-red-100 text-red-700' 
            : 'bg-blue-100 text-blue-700'
        }`}>
          <Upload size={20} className="mr-2" />
          {selectedImages.length} / {maxImages} photos
        </div>
      </div>

      {/* Image Preview Grid */}
      {selectedImages.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            📸 Photos sélectionnées ({selectedImages.length})
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {selectedImages.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg shadow-md border-2 border-gray-200"
                />

                {/* Numéro de page */}
                <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                  {index + 1}
                </div>

                {/* Bouton supprimer */}
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 transform hover:scale-110"
                  title="Supprimer"
                >
                  <X size={16} />
                </button>

                {/* Overlay au hover */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-lg pointer-events-none"></div>
              </div>
            ))}
          </div>

          {/* Bouton Ajouter Plus */}
          {canAddMore && (
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={handleCameraClick}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg transition-all border-2 border-blue-200"
              >
                <Camera size={20} />
                Ajouter (caméra)
              </button>

              <button
                type="button"
                onClick={handleGalleryClick}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold rounded-lg transition-all border-2 border-purple-200"
              >
                <ImageIcon size={20} />
                Ajouter (galerie)
              </button>
            </div>
          )}
        </div>
      )}

      {/* Info message */}
      {selectedImages.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
          <p className="text-blue-800 font-medium mb-2">
            📱 Choisissez votre méthode préférée
          </p>
          <p className="text-sm text-blue-600">
            • Caméra : Prenez des photos en direct<br />
            • Galerie : Sélectionnez des photos existantes<br />
            • Maximum {maxImages} photos
          </p>
        </div>
      )}

      {/* Warning si limite atteinte */}
      {!canAddMore && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
          <p className="text-orange-800 font-medium">
            ⚠️ Limite de {maxImages} photos atteinte
          </p>
          <p className="text-sm text-orange-600 mt-1">
            Supprimez des photos pour en ajouter d'autres
          </p>
        </div>
      )}
    </div>
  );
}