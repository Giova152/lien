'use client';

import React, { useState, useRef } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { X, Upload, Loader2, Check } from '@/components/ui/Icons';

interface ImageCropperModalProps {
  isOpen: boolean;
  onClose: () => void;
  aspectRatio?: number; // 1 for avatar, 3 for cover banner
  title: string;
  onCropComplete: (file: File) => Promise<void>;
}

export function ImageCropperModal({
  isOpen,
  onClose,
  aspectRatio = 1,
  title,
  onCropComplete,
}: ImageCropperModalProps) {
  const [imgSrc, setImgSrc] = useState('');
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [loading, setLoading] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  if (!isOpen) return null;

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCrop(undefined);
      const reader = new FileReader();
      reader.addEventListener('load', () => setImgSrc(reader.result?.toString() || ''));
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    imgRef.current = e.currentTarget;

    const initialCrop = centerCrop(
      makeAspectCrop({ unit: '%', width: 90 }, aspectRatio, width, height),
      width,
      height
    );
    setCrop(initialCrop);
  };

  const getCroppedImg = async (image: HTMLImageElement, crop: PixelCrop): Promise<File> => {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width * scaleX;
    canvas.height = crop.height * scaleY;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width * scaleX,
        crop.height * scaleY
      );
    }

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) return;
        const croppedFile = new File([blob], 'cropped-image.webp', { type: 'image/webp' });
        resolve(croppedFile);
      }, 'image/webp', 0.9);
    });
  };

  const handleSave = async () => {
    if (!imgRef.current || !completedCrop) return;

    try {
      setLoading(true);
      const file = await getCroppedImg(imgRef.current, completedCrop);
      await onCropComplete(file);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-neutral-800 text-white rounded-3xl max-w-lg w-full p-6 relative shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800 mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded-full hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!imgSrc ? (
          <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-neutral-700 rounded-2xl p-6 hover:border-indigo-500 transition cursor-pointer relative">
            <input
              type="file"
              accept="image/png, image/jpeg, image/webp"
              onChange={onSelectFile}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <Upload className="w-10 h-10 text-indigo-400 mb-3" />
            <p className="text-sm font-medium mb-1">Cliquez ou glissez une image ici</p>
            <p className="text-xs text-neutral-400">JPG, PNG ou WEBP (max 5 Mo)</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="max-h-[350px] overflow-hidden rounded-xl bg-black flex items-center justify-center">
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={aspectRatio}
              >
                <img
                  src={imgSrc}
                  onLoad={onImageLoad}
                  alt="Crop preview"
                  className="max-h-[350px] object-contain"
                />
              </ReactCrop>
            </div>

            <div className="flex items-center gap-3 w-full pt-2">
              <button
                type="button"
                onClick={() => setImgSrc('')}
                className="flex-1 py-2.5 bg-neutral-800 hover:bg-neutral-700 font-medium rounded-xl text-sm transition"
              >
                Changer d'image
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={loading || !completedCrop}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-sm flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Valider et envoyer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
