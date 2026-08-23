export interface PlatformInfo {
  id: string;
  name: string;
  iconName: string;
  color: string;
  placeholder: string;
}

export const PLATFORMS: Record<string, PlatformInfo> = {
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    iconName: 'Instagram',
    color: '#E4405F',
    placeholder: 'https://instagram.com/votre_username',
  },
  whatsapp: {
    id: 'whatsapp',
    name: 'WhatsApp',
    iconName: 'MessageCircle',
    color: '#25D366',
    placeholder: 'https://wa.me/33612345678',
  },
  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn',
    iconName: 'Linkedin',
    color: '#0A66C2',
    placeholder: 'https://linkedin.com/in/votre_profil',
  },
  tiktok: {
    id: 'tiktok',
    name: 'TikTok',
    iconName: 'Video',
    color: '#000000',
    placeholder: 'https://tiktok.com/@votre_username',
  },
  x: {
    id: 'x',
    name: 'X (Twitter)',
    iconName: 'Twitter',
    color: '#1DA1F2',
    placeholder: 'https://x.com/votre_username',
  },
  youtube: {
    id: 'youtube',
    name: 'YouTube',
    iconName: 'Youtube',
    color: '#FF0000',
    placeholder: 'https://youtube.com/@votre_chaine',
  },
  facebook: {
    id: 'facebook',
    name: 'Facebook',
    iconName: 'Facebook',
    color: '#1877F2',
    placeholder: 'https://facebook.com/votre_page',
  },
  snapchat: {
    id: 'snapchat',
    name: 'Snapchat',
    iconName: 'Ghost',
    color: '#FFFC00',
    placeholder: 'https://snapchat.com/add/votre_username',
  },
  github: {
    id: 'github',
    name: 'GitHub',
    iconName: 'Github',
    color: '#181717',
    placeholder: 'https://github.com/votre_username',
  },
  email: {
    id: 'email',
    name: 'Email',
    iconName: 'Mail',
    color: '#EA4335',
    placeholder: 'mailto:votre@email.com',
  },
  phone: {
    id: 'phone',
    name: 'Téléphone',
    iconName: 'Phone',
    color: '#34A853',
    placeholder: 'tel:+33612345678',
  },
  website: {
    id: 'website',
    name: 'Site Web',
    iconName: 'Globe',
    color: '#4A5568',
    placeholder: 'https://votre-site.com',
  },
};

export function detectPlatformFromUrl(url: string): { platform: string; label: string } {
  if (!url) return { platform: 'website', label: 'Lien personnalisé' };

  const lowerUrl = url.toLowerCase();

  if (lowerUrl.includes('instagram.com')) return { platform: 'instagram', label: 'Instagram' };
  if (lowerUrl.includes('wa.me') || lowerUrl.includes('whatsapp.com')) return { platform: 'whatsapp', label: 'WhatsApp' };
  if (lowerUrl.includes('linkedin.com')) return { platform: 'linkedin', label: 'LinkedIn' };
  if (lowerUrl.includes('tiktok.com')) return { platform: 'tiktok', label: 'TikTok' };
  if (lowerUrl.includes('x.com') || lowerUrl.includes('twitter.com')) return { platform: 'x', label: 'X (Twitter)' };
  if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) return { platform: 'youtube', label: 'YouTube' };
  if (lowerUrl.includes('facebook.com') || lowerUrl.includes('fb.watch')) return { platform: 'facebook', label: 'Facebook' };
  if (lowerUrl.includes('snapchat.com')) return { platform: 'snapchat', label: 'Snapchat' };
  if (lowerUrl.includes('github.com')) return { platform: 'github', label: 'GitHub' };
  if (lowerUrl.startsWith('mailto:')) return { platform: 'email', label: 'Email' };
  if (lowerUrl.startsWith('tel:')) return { platform: 'phone', label: 'Téléphone' };

  return { platform: 'website', label: 'Lien Web' };
}
