import type { Metadata } from 'next';
import { Inter, Outfit, Playfair_Display, Space_Grotesk } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space' });

export const metadata: Metadata = {
  title: 'Lien.me — Votre Carte de Visite Digitale & Link in Bio',
  description:
    'Créez et personnalisez votre page de profil professionnelle, centralisez vos liens sociaux, coordonnées de contact vCard et QR code en une minute.',
  openGraph: {
    title: 'Lien.me — Carte de visite digitale & Link in bio',
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
      className={`${inter.variable} ${outfit.variable} ${playfair.variable} ${spaceGrotesk.variable} dark`}
    >
      <body className="bg-neutral-950 text-neutral-100 antialiased min-h-screen flex flex-col font-sans">
        {children}
        <Toaster position="top-right" theme="dark" richColors />
      </body>
    </html>
  );
}
