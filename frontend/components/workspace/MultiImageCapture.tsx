'use client';

import { useState, useRef } from 'react';
import { Camera, Image as ImageIcon, X, Upload, Plus } from 'lucide-react';

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
    const remainingSlots = maxImages - selectedImages.length;
    const filesToProcess = Math.min(files.length, remainingSlots);

    for (let i = 0; i < filesToProcess; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;
      const base64 = await fileToBase64(file);
      newImages.push(base64);
    }

    const updatedImages = [...selectedImages, ...newImages];
    setSelectedImages(updatedImages);
    onImagesSelected(updatedImages);

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

  const canAddMore = selectedImages.length < maxImages;

  return (
    <div className="space-y-8 animate-in fade-in">

      {/* --- GRILLE DE PHOTOS SÉLECTIONNÉES --- */}
      {selectedImages.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8">
          {selectedImages.map((image, index) => (
            <div key={index} className="relative group aspect-[3/4] rounded-3xl overflow-hidden border-2 border-slate-100 bg-white shadow-sm hover:shadow-md transition-all">
              <img
                src={image}
                alt={`Page ${index + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              {/* Badge Numéro */}
              <div className="absolute top-3 left-3 bg-white text-slate-900 text-xs font-black px-2.5 py-1 rounded-full shadow-sm border border-slate-100">
                {index + 1}
              </div>

              {/* Bouton Supprimer */}
              <button
                onClick={() => removeImage(index)}
                className="absolute top-3 right-3 bg-red-500 text-white p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 hover:scale-110"
                title="Supprimer"
              >
                <X size={14} strokeWidth={3} />
              </button>
            </div>
          ))}

          {/* Bouton "+" (Ajout Rapide) */}
          {canAddMore && (
             <button
               onClick={() => galleryInputRef.current?.click()}
               className="aspect-[3/4] rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-all group"
             >
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                    <Plus size={20} strokeWidth={3} />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider">Ajouter</span>
             </button>
          )}
        </div>
      )}

      {/* --- SÉLECTEUR INITIAL (SI VIDE) --- */}
      {selectedImages.length === 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Option Caméra */}
          <div
            onClick={() => cameraInputRef.current?.click()}
            className="group bg-white border-2 border-slate-100 rounded-[2rem] p-8 text-center cursor-pointer hover:border-slate-900 hover:shadow-lg transition-all duration-300 active:scale-95"
          >
            <div className="w-20 h-20 bg-slate-50 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 group-hover:bg-slate-900 group-hover:text-white transition-colors">
              <Camera size={36} strokeWidth={2} />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 mb-2">Prendre une photo</h3>
            <p className="text-slate-500 font-medium text-sm">Utilisez votre caméra</p>
          </div>

          {/* Option Galerie */}
          <div
            onClick={() => galleryInputRef.current?.click()}
            className="group bg-white border-2 border-slate-100 rounded-[2rem] p-8 text-center cursor-pointer hover:border-blue-600 hover:shadow-lg transition-all duration-300 active:scale-95"
          >
            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <ImageIcon size={36} strokeWidth={2} />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 mb-2">Importer</h3>
            <p className="text-slate-500 font-medium text-sm">Depuis la galerie</p>
          </div>
        </div>
      )}

      {/* --- INPUTS CACHÉS --- */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        className="hidden"
        onChange={(e) => handleImageSelection(e.target.files)}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleImageSelection(e.target.files)}
      />

      {/* --- COMPTEUR --- */}
      <div className="text-center pt-4">
        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border-2 ${
          selectedImages.length >= maxImages 
            ? 'bg-red-50 text-red-600 border-red-100' 
            : 'bg-slate-50 text-slate-500 border-slate-100'
        }`}>
          <Upload size={14} />
          {selectedImages.length} / {maxImages} Pages
        </span>
      </div>
    </div>
  );
}