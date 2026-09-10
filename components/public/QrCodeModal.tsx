'use client';

import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, X, Download, Copy, Check, ShieldAlert, ExternalLink, Globe } from '@/components/ui/Icons';
import { Profile } from '@/types';
import { sanitizeUsername } from '@/lib/utils';
import { toast } from 'sonner';

interface QrCodeModalProps {
  profile: Profile;
  url?: string;
  triggerStyle?: 'button' | 'icon';
  lang?: 'fr' | 'en';
}

export function QrCodeModal({ profile, url, triggerStyle = 'button', lang = 'fr' }: QrCodeModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [profileUrl, setProfileUrl] = useState<string>(url || '');
  const [isLocalhost, setIsLocalhost] = useState(false);

  const cleanUsername = sanitizeUsername(profile.username);

  useEffect(() => {
    if (url) {
      setProfileUrl(url);
    } else if (typeof window !== 'undefined') {
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      setIsLocalhost(isLocal);
      // Utilisation du domaine public canonique officiel avec www pour éviter toute redirection 308
      let effectiveOrigin = isLocal
        ? (process.env.NEXT_PUBLIC_APP_URL || 'https://www.lien-bio.site')
        : window.location.origin;

      if (effectiveOrigin.includes('lien-bio.site') && !effectiveOrigin.includes('www.')) {
        effectiveOrigin = effectiveOrigin.replace('lien-bio.site', 'www.lien-bio.site');
      }

      setProfileUrl(`${effectiveOrigin}/${cleanUsername}`);
    }
  }, [url, cleanUsername]);

  const accentColor = profile.theme?.accent_color || '#C5A059';
  const textColor = profile.theme?.text_color || '#1C1917';

  const handleCopy = () => {
    if (!profileUrl) return;
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    toast.success('Lien copié dans le presse-papier !');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQr = () => {
    const svgElement = document.getElementById('profile-qrcode-svg');
    if (!svgElement) return;

    try {
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Résolution HD 800x800 pour impression et scan parfait
        const size = 800;
        const padding = 80;
        canvas.width = size;
        canvas.height = size;
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, size, size);
          ctx.drawImage(img, padding, padding, size - padding * 2, size - padding * 2);
          
          canvas.toBlob((blob) => {
            if (!blob) return;
            const objectUrl = URL.createObjectURL(blob);
            const downloadLink = document.createElement('a');
            downloadLink.download = `${cleanUsername}-qrcode.png`;
            downloadLink.href = objectUrl;
            downloadLink.click();
            setTimeout(() => URL.revokeObjectURL(objectUrl), 5000);
            toast.success('QR Code haute résolution téléchargé !');
          }, 'image/png');
        }
      };

      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    } catch (e) {
      console.error(e);
      toast.error('Erreur lors de la génération du fichier image');
    }
  };

  return (
    <>
      {/* Trigger Button */}
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
            <span>{lang === 'en' ? 'Show QR Code' : 'Afficher le QR Code'}</span>
          </button>
        </div>
      )}

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-neutral-900 border border-neutral-800 text-white rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl relative flex flex-col items-center text-center">
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded-full hover:bg-neutral-800 transition cursor-pointer"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black mb-1">{profile.display_name}</h3>
            <p className="text-xs text-neutral-400 mb-4">
              {lang === 'en' ? 'Scan with your phone camera' : "Scannez avec l'appareil photo de votre téléphone"}
            </p>

            {/* Unpublished Warning if Profile is hidden */}
            {!profile.is_published && (
              <div className="w-full mb-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] flex items-center gap-2 text-left">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>
                  {lang === 'en'
                    ? 'Profile is currently unpublished. Enable it in settings.'
                    : "Profil actuellement masqué. Activez-le dans les paramètres pour qu'il réponde au scan."}
                </span>
              </div>
            )}

            {/* Notification de redirection optimisée */}
            {isLocalhost && (
              <div className="w-full mb-3 px-3 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-[11px] flex items-center gap-2 text-left">
                <Globe className="w-3.5 h-3.5 shrink-0 text-indigo-400" />
                <span>
                  {lang === 'en'
                    ? 'QR Code points to canonical live URL for seamless mobile scanning.'
                    : 'QR Code pointant vers le lien public pour un scan mobile réussi.'}
                </span>
              </div>
            )}

            {/* QR Code Container - Pure White with high contrast and Quiet Zone */}
            <div className="bg-white p-3 rounded-2xl shadow-xl mb-4 ring-8 ring-white/10 flex items-center justify-center">
              {profileUrl ? (
                <QRCodeSVG
                  id="profile-qrcode-svg"
                  value={profileUrl}
                  size={210}
                  level="M"
                  includeMargin={true}
                />
              ) : (
                <div className="w-[210px] h-[210px] flex items-center justify-center text-xs text-neutral-500">
                  {lang === 'en' ? 'Generating QR Code...' : 'Génération du QR Code...'}
                </div>
              )}
            </div>

            {/* URL Display & Copy */}
            <div className="w-full flex items-center justify-between bg-neutral-800/90 border border-neutral-700/60 rounded-xl px-3 py-2 text-xs mb-3 text-neutral-200">
              <span className="truncate max-w-[200px] font-mono text-[11px]">{profileUrl}</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 font-bold text-indigo-400 hover:text-indigo-300 ml-2 cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copied ? (lang === 'en' ? 'Copied!' : 'Copié !') : (lang === 'en' ? 'Copy' : 'Copier')}
              </button>
            </div>

            {/* Action Buttons */}
            <div className="w-full flex flex-col gap-2">
              <button
                onClick={handleDownloadQr}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-md cursor-pointer"
              >
                <Download className="w-4 h-4" />
                {lang === 'en' ? 'Download QR Code PNG' : 'Télécharger le QR Code PNG'}
              </button>

              <a
                href={profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white font-medium rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                {lang === 'en' ? 'Open link in new tab' : 'Ouvrir le lien dans un nouvel onglet'}
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
