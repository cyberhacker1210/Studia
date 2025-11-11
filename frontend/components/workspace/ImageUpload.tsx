'use client';

import { useRef } from 'react';
import { Camera, X, Check } from 'lucide-react';

interface ImageUploadProps {
  onImageSelected: (imageData: string) => void;
  selectedImage: string | null;
  onClear: () => void;
}

export default function ImageUpload({ onImageSelected, selectedImage, onClear }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleFile = (file: File) => {
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Image trop grande. Taille maximale : 10MB.');
      return;
    }

    // Read file as base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onImageSelected(result);
    };
    reader.readAsDataURL(file);
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  // After selection - Display image
  if (selectedImage) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 text-green-600">
            <Check size={20} />
            <span className="font-medium">Photo prise avec succès</span>
          </div>
          <button
            onClick={onClear}
            className="text-gray-400 hover:text-red-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="relative rounded-lg overflow-hidden border-2 border-gray-200">
          <img
            src={selectedImage}
            alt="Course preview"
            className="w-full max-h-96 object-contain bg-gray-50"
          />
        </div>

        <p className="text-sm text-gray-500 mt-4 text-center">
          Prêt à générer le quiz depuis cette photo
        </p>
      </div>
    );
  }

  // Before selection - Camera button
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="text-center">
        <button
          onClick={handleCameraClick}
          className="group relative w-full max-w-md mx-auto"
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

        <div className="mt-6 space-y-2 text-gray-600">
          <p className="text-sm">
            📸 <strong>Sur mobile :</strong> La caméra s'ouvrira directement
          </p>
          <p className="text-sm">
            💻 <strong>Sur ordinateur :</strong> Sélectionnez une image
          </p>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2">💡 Conseils :</h4>
          <ul className="text-sm text-blue-800 space-y-1 text-left">
            <li>✓ Texte lisible</li>
            <li>✓ Bon éclairage</li>
            <li>✓ Photo bien cadrée</li>
            <li>✓ Évitez le flou</li>
          </ul>
        </div>
      </div>
    </div>
  );
}