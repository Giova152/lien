'use client';

import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, X, Download, Copy, Check, ShieldAlert } from '@/components/ui/Icons';
import { Profile } from '@/types';
import { sanitizeUsername } from '@/lib/utils';

interface QrCodeModalProps {
  profile: Profile;
  url?: string;
  triggerStyle?: 'button' | 'icon';
}

export function QrCodeModal({ profile, url, triggerStyle = 'button' }: QrCodeModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [profileUrl, setProfileUrl] = useState<string>(url || '');
  const [isLocalhost, setIsLocalhost] = useState(false);

  const cleanUsername = sanitizeUsername(profile.username);

  useEffect(() => {
    if (url) {
      setProfileUrl(url);
    } else if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      setIsLocalhost(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
      setProfileUrl(`${origin}/${cleanUsername}`);
    }
  }, [url, cleanUsername]);

  const accentColor = profile.theme?.accent_color || '#C5A059';
  const textColor = profile.theme?.text_color || '#1C1917';

  const handleCopy = () => {
    if (!profileUrl) return;
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
        downloadLink.download = `${cleanUsername}-qrcode.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      }
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <>
      {/* Clean Non-Overlapping Inline Trigger Button */}
      {triggerStyle === 'icon' ? (
        <button
          onClick={() => setIsOpen(true)}
          className="w-9 h-9 rounded-full bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/20 backdrop-blur-md flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-sm shrink-0"
          style={{ color: textColor }}
          title="QR Code"
        >
          <QrCode className="w-4 h-4" />
        </button>
      ) : (
        <div className="w-full flex justify-center my-3">
          <button
            onClick={() => setIsOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/20 backdrop-blur-md text-xs font-bold transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm"
            style={{ color: textColor }}
          >
            <QrCode className="w-4 h-4" style={{ color: accentColor }} />
            <span>Afficher le QR Code</span>
          </button>
        </div>
      )}

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
            <p className="text-sm text-neutral-400 mb-4">Scannez avec l'appareil photo de votre téléphone</p>

            {/* Unpublished Warning if Profile is hidden */}
            {!profile.is_published && (
              <div className="w-full mb-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] flex items-center gap-2 text-left">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>Profil actuellement dépublié. Publiez-le dans les paramètres pour qu'il réponde au scan.</span>
              </div>
            )}

            {/* Localhost Warning if scanning on local computer */}
            {isLocalhost && (
              <div className="w-full mb-3 p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-[11px] text-left">
                💡 <b>Info Test Local :</b> Sur ordinateur, le QR Code pointe vers <code>localhost</code>. Testez directement depuis votre lien en ligne Vercel !
              </div>
            )}

            {/* QR Code Container */}
            <div className="bg-white p-4 rounded-2xl shadow-inner mb-4">
              {profileUrl ? (
                <QRCodeSVG
                  id="profile-qrcode-svg"
                  value={profileUrl}
                  size={200}
                  level="H"
                  includeMargin={false}
                />
              ) : (
                <div className="w-[200px] h-[200px] flex items-center justify-center text-xs text-neutral-500">
                  Génération du QR Code...
                </div>
              )}
            </div>

            {/* URL Display & Copy */}
            <div className="w-full flex items-center justify-between bg-neutral-800 rounded-xl px-3 py-2 text-xs mb-4 text-neutral-300">
              <span className="truncate max-w-[200px] font-mono text-[11px]">{profileUrl}</span>
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
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-sm flex items-center justify-center gap-2 transition shadow-lg"
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
