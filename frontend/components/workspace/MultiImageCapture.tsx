'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, X, Plus, Check, Trash2, Image as ImageIcon } from 'lucide-react';

interface MultiImageCaptureProps {
  onImagesSelected: (images: string[]) => void;
  maxImages?: number;
}

export default function MultiImageCapture({
  onImagesSelected,
  maxImages = 10
}: MultiImageCaptureProps) {
  const [images, setImages] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Détection mobile
    const checkMobile = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const touchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsMobile(mobile || touchScreen);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (images.length + files.length > maxImages) {
      alert(`Maximum ${maxImages} images autorisées`);
      return;
    }

    files.forEach(file => {
      if (file.size > 10 * 1024 * 1024) {
        alert('Image trop grande. Maximum 10MB par image.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        setImages(prev => [...prev, imageData]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    if (confirm('Supprimer toutes les images ?')) {
      setImages([]);
    }
  };

  const handleConfirm = () => {
    if (images.length === 0) {
      alert('Ajoutez au moins une image');
      return;
    }
    onImagesSelected(images);
  };

  const handleReorder = (fromIndex: number, toIndex: number) => {
    const newImages = [...images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    setImages(newImages);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-100">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900">
          📸 Photos du Cours ({images.length}/{maxImages})
        </h3>
        {images.length > 0 && (
          <button
            onClick={clearAll}
            className="text-sm text-red-600 hover:text-red-700 font-semibold"
          >
            Tout supprimer
          </button>
        )}
      </div>

      {/* Inputs cachés */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Boutons de sélection - DIFFÉRENTS selon appareil */}
      {images.length === 0 ? (
        isMobile ? (
          /* VERSION MOBILE : 2 boutons (Caméra + Galerie) */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {/* Bouton Caméra */}
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="group relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-2xl p-8 transition-all shadow-lg hover:shadow-xl active:scale-95"
            >
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
                  <Camera size={32} />
                </div>
                <h4 className="text-xl font-bold mb-2">Prendre une Photo</h4>
                <p className="text-sm text-blue-100">
                  📱 Ouvre la caméra
                </p>
              </div>
            </button>

            {/* Bouton Galerie */}
            <button
              onClick={() => galleryInputRef.current?.click()}
              className="group relative overflow-hidden bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-2xl p-8 transition-all shadow-lg hover:shadow-xl active:scale-95"
            >
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
                  <ImageIcon size={32} />
                </div>
                <h4 className="text-xl font-bold mb-2">Depuis la Galerie</h4>
                <p className="text-sm text-purple-100">
                  🖼️ Sélectionner des photos
                </p>
              </div>
            </button>
          </div>
        ) : (
          /* VERSION DESKTOP : 1 seul bouton */
          <button
            onClick={() => galleryInputRef.current?.click()}
            className="w-full group relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-2xl p-12 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-6 backdrop-blur-sm group-hover:scale-110 transition-transform">
                <Plus size={40} />
              </div>
              <h4 className="text-2xl font-bold mb-3">Ajouter des Images</h4>
              <p className="text-lg text-blue-100 mb-2">
                💻 Sélectionnez une ou plusieurs images
              </p>
              <p className="text-sm text-blue-200">
                Formats acceptés : JPG, PNG • Max 10MB par image
              </p>
            </div>
          </button>
        )
      ) : (
        <>
          {/* Grille d'images (identique pour mobile et desktop) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
            {images.map((img, index) => (
              <div
                key={index}
                className="relative group"
                draggable
                onDragStart={(e) => e.dataTransfer.setData('text/plain', index.toString())}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                  handleReorder(fromIndex, index);
                }}
              >
                <img
                  src={img}
                  alt={`Page ${index + 1}`}
                  className="w-full h-32 sm:h-40 object-cover rounded-lg border-2 border-gray-200 group-hover:border-blue-500 transition-all cursor-move"
                />

                {/* Numéro de page */}
                <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold shadow-lg">
                  Page {index + 1}
                </div>

                {/* Bouton supprimer */}
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 w-7 h-7 sm:w-8 sm:h-8 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-700 active:scale-95"
                >
                  <X size={16} />
                </button>

                {/* Icône drag - Desktop uniquement */}
                {!isMobile && (
                  <div className="absolute bottom-2 right-2 bg-gray-900/50 backdrop-blur-sm text-white px-2 py-1 rounded text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                    ⇅ Glisser
                  </div>
                )}
              </div>
            ))}

            {/* Bouton ajouter (adaptatif) */}
            {images.length < maxImages && (
              <div className="h-32 sm:h-40 relative">
                <button
                  onClick={() => galleryInputRef.current?.click()}
                  className="absolute inset-0 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all flex flex-col items-center justify-center text-gray-500 hover:text-blue-600 group"
                >
                  <Plus size={32} className="mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-xs sm:text-sm font-semibold">
                    {isMobile ? 'Ajouter' : 'Ajouter des images'}
                  </span>
                </button>

                {/* Bouton caméra - Mobile uniquement */}
                {isMobile && (
                  <button
                    onClick={() => cameraInputRef.current?.click()}
                    className="absolute -top-2 -right-2 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 active:scale-95 transition-all"
                  >
                    <Camera size={20} />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Boutons d'action - Adaptatifs */}
          <div className="flex flex-col sm:flex-row gap-3">
            {isMobile ? (
              /* Mobile : 2 boutons */
              <>
                <button
                  onClick={() => galleryInputRef.current?.click()}
                  disabled={images.length >= maxImages}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg active:scale-95"
                >
                  <ImageIcon size={20} />
                  <span className="text-sm">Galerie</span>
                </button>

                <button
                  onClick={() => cameraInputRef.current?.click()}
                  disabled={images.length >= maxImages}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg active:scale-95"
                >
                  <Camera size={20} />
                  <span className="text-sm">Photo</span>
                </button>
              </>
            ) : (
              /* Desktop : 1 bouton */
              <button
                onClick={() => galleryInputRef.current?.click()}
                disabled={images.length >= maxImages}
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Plus size={20} />
                <span>Ajouter d'autres images</span>
              </button>
            )}
          </div>
        </>
      )}

      {/* Bouton de validation */}
      {images.length > 0 && (
        <button
          onClick={handleConfirm}
          className="w-full mt-4 flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-bold hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl active:scale-95"
        >
          <Check size={24} />
          <span>Valider ({images.length} photo{images.length > 1 ? 's' : ''})</span>
        </button>
      )}

      {/* Info Box - Adaptatif */}
      <div className="mt-4 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-xs sm:text-sm text-blue-800">
          💡 <strong>Astuces :</strong>
        </p>
        <ul className="text-xs sm:text-sm text-blue-700 mt-2 space-y-1 ml-4 list-disc">
          {isMobile ? (
            <>
              <li>📱 Utilisez la caméra ou votre galerie</li>
              <li>🔢 L'ordre des photos = ordre des pages</li>
            </>
          ) : (
            <>
              <li>💻 Sélectionnez plusieurs images d'un coup</li>
              <li>🔄 Glissez-déposez pour réorganiser</li>
            </>
          )}
          <li>📄 Maximum {maxImages} pages par cours</li>
          <li>📏 Max 10MB par image</li>
        </ul>
      </div>

      {/* Progress Indicator */}
      {images.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>{images.length} / {maxImages} images</span>
            <span>{Math.round((images.length / maxImages) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(images.length / maxImages) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}