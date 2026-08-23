'use client';

import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, X, Download, Copy, Check } from '@/components/ui/Icons';
import { Profile } from '@/types';

interface QrCodeModalProps {
  profile: Profile;
  url?: string;
}

export function QrCodeModal({ profile, url }: QrCodeModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const profileUrl =
    url || (typeof window !== 'undefined' ? `${window.location.origin}/${profile.username}` : `https://lien.me/${profile.username}`);

  const handleCopy = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQr = () => {
    const svgElement = document.getElementById('profile-qrcode-svg');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width + 40;
      canvas.height = img.height + 40;
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 20, 20);
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `${profile.username}-qrcode.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      }
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <>
      {/* Floating QR Code Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-neutral-900/90 text-white border border-white/20 shadow-2xl flex items-center justify-center backdrop-blur-md hover:scale-110 active:scale-95 transition-all"
        title="Afficher le QR Code"
      >
        <QrCode className="w-6 h-6" />
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-neutral-900 border border-neutral-800 text-white rounded-3xl p-6 max-w-sm w-full shadow-2xl relative flex flex-col items-center text-center">
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded-full hover:bg-neutral-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold mb-1">{profile.display_name}</h3>
            <p className="text-sm text-neutral-400 mb-5">Scannez pour ouvrir la carte</p>

            {/* QR Code Container */}
            <div className="bg-white p-4 rounded-2xl shadow-inner mb-5">
              <QRCodeSVG
                id="profile-qrcode-svg"
                value={profileUrl}
                size={200}
                level="H"
                includeMargin={false}
              />
            </div>

            {/* URL Display & Copy */}
            <div className="w-full flex items-center justify-between bg-neutral-800 rounded-xl px-3 py-2 text-xs mb-4 text-neutral-300">
              <span className="truncate max-w-[200px]">{profileUrl}</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 font-medium text-indigo-400 hover:text-indigo-300 ml-2"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copié' : 'Copier'}
              </button>
            </div>

            {/* Download Button */}
            <button
              onClick={handleDownloadQr}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-sm flex items-center justify-center gap-2 transition"
            >
              <Download className="w-4 h-4" />
              Télécharger le QR Code PNG
            </button>
          </div>
        </div>
      )}
    </>
  );
}
