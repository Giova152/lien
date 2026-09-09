import React from 'react';
import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { ArrowRight } from '@/components/ui/Icons';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center font-sans">
      <div className="mb-6">
        <Logo href="/" size="lg" />
      </div>

      <div className="max-w-md w-full bg-white border border-neutral-200/80 rounded-3xl p-8 sm:p-10 shadow-xl shadow-neutral-200/50 flex flex-col items-center">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-5 shadow-xs">
          <span className="text-2xl font-black">404</span>
        </div>

        <h1 className="text-xl font-extrabold text-neutral-900 mb-2">Page introuvable</h1>
        <p className="text-xs text-neutral-500 mb-6 leading-relaxed">
          Le profil ou la page que vous recherchez n'existe pas ou a été déplacé.
        </p>

        <Link
          href="/"
          className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition shadow-sm hover:shadow-md"
        >
          <span>Retour à l'accueil</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
