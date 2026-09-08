import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Lien-Bio — Carte de Visite Digitale',
    short_name: 'Lien-Bio',
    description: 'Votre carte de visite digitale, lien en bio et profil professionnel tout-en-un.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#4F46E5',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
      {
        src: '/apple-icon.svg',
        sizes: '180x180',
        type: 'image/svg+xml',
      },
    ],
  };
}
