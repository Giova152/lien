import type { Metadata } from 'next';
import { Inter, Outfit, Playfair_Display, Space_Grotesk } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space' });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://www.lien-bio.site'),
  title: 'Lien-Bio — Votre Carte de Visite Digitale & Link in Bio',
  description:
    'Créez et personnalisez votre page de profil professionnelle, centralisez vos liens sociaux, coordonnées de contact vCard et QR code en une minute.',
  icons: {
    icon: [
      { url: '/favicon.ico?v=2', sizes: '32x32' },
      { url: '/icon.svg?v=2', type: 'image/svg+xml' },
      { url: '/icon.png?v=2', sizes: '32x32', type: 'image/png' },
    ],
    shortcut: '/favicon.ico?v=2',
    apple: [
      { url: '/apple-icon.png?v=2', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'Lien-Bio — Carte de visite digitale & Link in bio',
    description: 'Partagez tous vos liens et coordonnées professionnelles en un seul endroit.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${outfit.variable} ${playfair.variable} ${spaceGrotesk.variable} scroll-smooth`}
    >
      <head>
        <link rel="icon" href="/favicon.ico?v=2" sizes="any" />
        <link rel="icon" href="/icon.svg?v=2" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-icon.png?v=2" />
      </head>
      <body className="bg-white text-neutral-900 antialiased min-h-screen flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
        {children}
        <Toaster position="top-right" theme="light" richColors closeButton />
      </body>
    </html>
  );
}
