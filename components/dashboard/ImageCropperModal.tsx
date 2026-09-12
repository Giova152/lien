'use client';

import React, { useState, useRef, useEffect } from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import {
  X,
  Upload,
  Loader2,
  Check,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RefreshCw,
  Camera,
} from '@/components/ui/Icons';

interface ImageCropperModalProps {
  isOpen: boolean;
  onClose: () => void;
  aspectRatio?: number; // 1 for avatar, 3 for cover banner
  title: string;
  onCropComplete: (file: File) => Promise<void>;
}

function calculateInitialCrop(width: number, height: number, aspect: number) {
  const imageAspect = width / height;
  let baseWidthPercent: number;
  let baseHeightPercent: number;

  if (imageAspect > aspect) {
    // Landscape relative to crop aspect -> Height is the constraint
    baseHeightPercent = 85;
    const cropPixelHeight = (height * baseHeightPercent) / 100;
    const cropPixelWidth = cropPixelHeight * aspect;
    baseWidthPercent = (cropPixelWidth / width) * 100;
  } else {
    // Portrait relative to crop aspect -> Width is the constraint
    baseWidthPercent = 85;
    const cropPixelWidth = (width * baseWidthPercent) / 100;
    const cropPixelHeight = cropPixelWidth / aspect;
    baseHeightPercent = (cropPixelHeight / height) * 100;
  }

  const crop: Crop = {
    unit: '%',
    width: Math.min(95, baseWidthPercent),
    height: Math.min(95, baseHeightPercent),
    x: Math.max(0, (100 - baseWidthPercent) / 2),
    y: Math.max(0, (100 - baseHeightPercent) / 2),
  };

  return { crop, baseWidthPercent, baseHeightPercent };
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
  const [zoom, setZoom] = useState<number>(1);
  const [loading, setLoading] = useState(false);

  const imgRef = useRef<HTMLImageElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const baseCropRef = useRef<{ width: number; height: number } | null>(null);

  // Close modal on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Reset state on open/close
  useEffect(() => {
    if (!isOpen) {
      setImgSrc('');
      setCrop(undefined);
      setCompletedCrop(undefined);
      setZoom(1);
      baseCropRef.current = null;
    }
  }, [isOpen]);

  // Live Canvas Preview update
  useEffect(() => {
    if (!completedCrop || !imgRef.current || !previewCanvasRef.current) {
      return;
    }

    const image = imgRef.current;
    const canvas = previewCanvasRef.current;
    const pixelCrop = completedCrop;

    if (!pixelCrop.width || !pixelCrop.height) return;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pixelRatio = window.devicePixelRatio || 1;
    const previewWidth = aspectRatio === 1 ? 88 : 160;
    const previewHeight = aspectRatio === 1 ? 88 : Math.round(160 / aspectRatio);

    canvas.width = previewWidth * pixelRatio;
    canvas.height = previewHeight * pixelRatio;

    ctx.scale(pixelRatio, pixelRatio);
    ctx.imageSmoothingQuality = 'high';

    ctx.save();
    ctx.clearRect(0, 0, previewWidth, previewHeight);

    // Apply circle mask for avatars
    if (aspectRatio === 1) {
      ctx.beginPath();
      ctx.arc(previewWidth / 2, previewHeight / 2, previewWidth / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
    }

    ctx.drawImage(
      image,
      pixelCrop.x * scaleX,
      pixelCrop.y * scaleY,
      pixelCrop.width * scaleX,
      pixelCrop.height * scaleY,
      0,
      0,
      previewWidth,
      previewHeight
    );

    ctx.restore();
  }, [completedCrop, aspectRatio]);

  if (!isOpen) return null;

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCrop(undefined);
      setCompletedCrop(undefined);
      setZoom(1);
      baseCropRef.current = null;

      const reader = new FileReader();
      reader.addEventListener('load', () => setImgSrc(reader.result?.toString() || ''));
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    imgRef.current = e.currentTarget;

    const { crop: initialCrop, baseWidthPercent, baseHeightPercent } = calculateInitialCrop(
      width,
      height,
      aspectRatio
    );
    baseCropRef.current = { width: baseWidthPercent, height: baseHeightPercent };
    setCrop(initialCrop);
    setZoom(1);

    setCompletedCrop({
      unit: 'px',
      x: (initialCrop.x * width) / 100,
      y: (initialCrop.y * height) / 100,
      width: (initialCrop.width * width) / 100,
      height: (initialCrop.height * height) / 100,
    });
  };

  const handleCropChange = (pixelCrop: PixelCrop, percentCrop: Crop) => {
    setCrop(percentCrop);
    if (baseCropRef.current && percentCrop.width) {
      const computedZoom = baseCropRef.current.width / percentCrop.width;
      setZoom(Math.max(1, Math.min(3, parseFloat(computedZoom.toFixed(2)))));
    }
  };

  const handleZoomChange = (newZoom: number) => {
    if (!baseCropRef.current || !imgRef.current) return;
    const clampedZoom = Math.max(1, Math.min(3, newZoom));
    setZoom(clampedZoom);

    const currentCrop = crop;
    const currentCenterX =
      currentCrop && currentCrop.x !== undefined
        ? currentCrop.x + (currentCrop.width || 0) / 2
        : 50;
    const currentCenterY =
      currentCrop && currentCrop.y !== undefined
        ? currentCrop.y + (currentCrop.height || 0) / 2
        : 50;

    const newWidth = baseCropRef.current.width / clampedZoom;
    const newHeight = baseCropRef.current.height / clampedZoom;

    let newX = currentCenterX - newWidth / 2;
    let newY = currentCenterY - newHeight / 2;

    if (newX < 0) newX = 0;
    if (newY < 0) newY = 0;
    if (newX + newWidth > 100) newX = 100 - newWidth;
    if (newY + newHeight > 100) newY = 100 - newHeight;

    const nextCrop: Crop = {
      unit: '%',
      x: newX,
      y: newY,
      width: newWidth,
      height: newHeight,
    };

    setCrop(nextCrop);

    if (imgRef.current) {
      const imgWidth = imgRef.current.width;
      const imgHeight = imgRef.current.height;
      setCompletedCrop({
        unit: 'px',
        x: (newX * imgWidth) / 100,
        y: (newY * imgHeight) / 100,
        width: (newWidth * imgWidth) / 100,
        height: (newHeight * imgHeight) / 100,
      });
    }
  };

  const rotateImage90 = () => {
    if (!imgRef.current) return;
    const img = imgRef.current;

    const canvas = document.createElement('canvas');
    canvas.width = img.naturalHeight;
    canvas.height = img.naturalWidth;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((90 * Math.PI) / 180);
    ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

    const rotatedDataUrl = canvas.toDataURL('image/png');
    setCrop(undefined);
    setCompletedCrop(undefined);
    setZoom(1);
    baseCropRef.current = null;
    setImgSrc(rotatedDataUrl);
  };

  const handleResetCrop = () => {
    if (!imgRef.current) return;
    const { width, height } = imgRef.current;
    const { crop: initialCrop, baseWidthPercent, baseHeightPercent } = calculateInitialCrop(
      width,
      height,
      aspectRatio
    );
    baseCropRef.current = { width: baseWidthPercent, height: baseHeightPercent };
    setCrop(initialCrop);
    setZoom(1);
    setCompletedCrop({
      unit: 'px',
      x: (initialCrop.x * width) / 100,
      y: (initialCrop.y * height) / 100,
      width: (initialCrop.width * width) / 100,
      height: (initialCrop.height * height) / 100,
    });
  };

  const getCroppedImg = async (image: HTMLImageElement, pixelCrop: PixelCrop): Promise<File> => {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const sourceX = pixelCrop.x * scaleX;
    const sourceY = pixelCrop.y * scaleY;
    const sourceWidth = pixelCrop.width * scaleX;
    const sourceHeight = pixelCrop.height * scaleY;

    // Optimal high resolution for web
    const targetWidth =
      aspectRatio === 1
        ? Math.min(800, Math.max(512, Math.round(sourceWidth)))
        : Math.min(1600, Math.max(900, Math.round(sourceWidth)));
    const targetHeight = Math.round(targetWidth / aspectRatio);

    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Canvas 2D context unavailable');
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(
      image,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      targetWidth,
      targetHeight
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Canvas blob generation failed'));
            return;
          }
          const croppedFile = new File([blob], 'cropped-image.webp', { type: 'image/webp' });
          resolve(croppedFile);
        },
        'image/webp',
        0.92
      );
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
      console.error('Crop save error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <style>{`
        .custom-cropper {
          max-width: 100%;
          display: inline-block;
          user-select: none;
        }
        .custom-cropper .ReactCrop__crop-selection {
          border: 2px solid #6366f1 !important;
          box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.75) !important;
          background-image: none !important;
        }
        .custom-cropper .ReactCrop--circular-crop .ReactCrop__crop-selection {
          border-radius: 50% !important;
          box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.75) !important;
        }
        .custom-cropper .ReactCrop__drag-handle {
          width: 14px !important;
          height: 14px !important;
          background-color: #ffffff !important;
          border: 2px solid #6366f1 !important;
          border-radius: 50% !important;
          box-shadow: 0 2px 6px rgba(0,0,0,0.5) !important;
        }
        .custom-cropper .ReactCrop__rule-of-thirds-vt,
        .custom-cropper .ReactCrop__rule-of-thirds-hz {
          opacity: 0.3 !important;
        }
      `}</style>

      <div className="bg-neutral-900 border border-neutral-800 text-white rounded-3xl max-w-2xl w-full p-5 sm:p-7 relative shadow-2xl flex flex-col gap-4 max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-neutral-800/80">
          <div>
            <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">{title}</h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              {aspectRatio === 1
                ? 'Cadrez votre visage dans le cercle pour un rendu optimal sur votre profil.'
                : 'Ajustez votre bannière panoramique (format 3:1).'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-2 rounded-full hover:bg-neutral-800 transition cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        {!imgSrc ? (
          <label className="flex flex-col items-center justify-center py-14 sm:py-20 border-2 border-dashed border-neutral-700 hover:border-indigo-500 bg-neutral-950/40 rounded-3xl p-6 transition cursor-pointer relative group">
            <input
              type="file"
              accept="image/png, image/jpeg, image/webp"
              onChange={onSelectFile}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-105 transition">
              <Upload className="w-8 h-8" />
            </div>
            <p className="text-sm sm:text-base font-bold text-white mb-1">
              Cliquez ou glissez une photo ici
            </p>
            <p className="text-xs text-neutral-400">Formats supportés : JPG, PNG ou WEBP (max 10 Mo)</p>
          </label>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Live Preview Bar */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-neutral-950/70 border border-neutral-800">
              <div className="flex items-center gap-3">
                <div
                  className={`overflow-hidden border-2 border-indigo-500 shadow-md shrink-0 bg-neutral-900 flex items-center justify-center ${
                    aspectRatio === 1 ? 'w-14 h-14 rounded-full' : 'w-24 h-8 rounded-lg'
                  }`}
                >
                  <canvas ref={previewCanvasRef} className="w-full h-full object-cover" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block leading-tight">
                    {aspectRatio === 1 ? 'Aperçu en direct' : 'Aperçu bannière'}
                  </span>
                  <span className="text-[11px] text-neutral-400 leading-tight">
                    Rendu final tel qu&apos;il apparaîtra sur votre page
                  </span>
                </div>
              </div>

              {/* Action shortcuts */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={rotateImage90}
                  className="px-2.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-200 flex items-center gap-1.5 transition cursor-pointer"
                  title="Pivoter de 90° vers la droite"
                >
                  <RotateCw className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="hidden sm:inline">Pivoter</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetCrop}
                  className="px-2.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-200 flex items-center gap-1.5 transition cursor-pointer"
                  title="Recentrer le cadrage"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-neutral-400" />
                  <span className="hidden sm:inline">Recentrer</span>
                </button>
              </div>
            </div>

            {/* Interactive Crop Workspace */}
            <div className="w-full min-h-[260px] max-h-[420px] rounded-2xl bg-neutral-950 flex items-center justify-center p-3 sm:p-4 border border-neutral-800 relative">
              <ReactCrop
                crop={crop}
                onChange={handleCropChange}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={aspectRatio}
                circularCrop={aspectRatio === 1}
                keepSelection
                ruleOfThirds
                className="custom-cropper"
              >
                <img
                  src={imgSrc}
                  onLoad={onImageLoad}
                  alt="Crop preview"
                  className="max-h-[380px] max-w-full object-contain rounded-lg block"
                />
              </ReactCrop>
            </div>

            {/* Zoom Slider Control */}
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-neutral-950/60 border border-neutral-800/80">
              <button
                type="button"
                onClick={() => handleZoomChange(zoom - 0.2)}
                disabled={zoom <= 1}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 disabled:opacity-40 transition cursor-pointer"
                aria-label="Zoom arrière"
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              <div className="flex-1 flex items-center gap-2">
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.05"
                  value={zoom}
                  onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                />
              </div>

              <button
                type="button"
                onClick={() => handleZoomChange(zoom + 0.2)}
                disabled={zoom >= 3}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 disabled:opacity-40 transition cursor-pointer"
                aria-label="Zoom avant"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              <span className="text-xs font-mono font-bold text-indigo-400 min-w-[36px] text-right">
                {zoom.toFixed(1)}x
              </span>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <label className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 font-bold rounded-xl text-xs text-neutral-300 transition cursor-pointer flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-neutral-400" />
                <span>Changer d&apos;image</span>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={onSelectFile}
                  className="hidden"
                />
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 bg-transparent hover:bg-neutral-800 text-neutral-400 hover:text-white font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  Annuler
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={loading || !completedCrop}
                  className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-600/25 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Optimisation...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Valider et enregistrer</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
