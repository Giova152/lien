import { Profile, ContactInfo } from '@/types';

export function generateVCard(profile: Profile, contact: ContactInfo | null): string {
  const lines: string[] = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${profile.display_name};;;;`,
    `FN:${profile.display_name}`,
  ];

  if (profile.title || profile.company) {
    if (profile.title) lines.push(`TITLE:${profile.title}`);
    if (profile.company) lines.push(`ORG:${profile.company}`);
  }

  if (profile.bio) {
    lines.push(`NOTE:${profile.bio.replace(/\n/g, '\\n')}`);
  }

  if (profile.avatar_url) {
    lines.push(`PHOTO;VALUE=URI:${profile.avatar_url}`);
  }

  if (contact) {
    if (contact.phone) {
      lines.push(`TEL;TYPE=CELL,VOICE:${contact.phone}`);
    }
    if (contact.whatsapp) {
      lines.push(`TEL;TYPE=WHATSAPP:${contact.whatsapp}`);
    }
    if (contact.email) {
      lines.push(`EMAIL;TYPE=INTERNET,PREF:${contact.email}`);
    }
    if (contact.address) {
      lines.push(`ADR;TYPE=WORK:;;${contact.address};;;;`);
    }
    if (contact.website) {
      lines.push(`URL:${contact.website}`);
    }
  }

  // canonical profile page link
  if (typeof window !== 'undefined') {
    lines.push(`URL;TYPE=PROFILE:${window.location.origin}/${profile.username}`);
  }

  lines.push('END:VCARD');
  return lines.join('\r\n');
}

export function downloadVCard(profile: Profile, contact: ContactInfo | null) {
  const vcardData = generateVCard(profile, contact);
  const blob = new Blob([vcardData], { type: 'text/vcard;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  const fileName = `${profile.username.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_contact.vcf`;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
