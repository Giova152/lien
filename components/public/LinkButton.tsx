'use client';

import React from 'react';
import { LinkItem, ThemeConfig } from '@/types';
import { PlatformIcon, ExternalLink } from '@/components/ui/Icons';
import { PLATFORMS } from '@/lib/platform-detector';

interface LinkButtonProps {
  link: LinkItem;
  theme: ThemeConfig;
}

export function LinkButton({ link, theme }: LinkButtonProps) {
  const handleClick = () => {
    try {
      fetch('/api/track-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkId: link.id }),
      }).catch(() => {});
    } catch {
      // ignore
    }
  };

  const getButtonStyle = (): React.CSSProperties => {
    const style: React.CSSProperties = {};

    if (theme.button_style === 'glass') {
      style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
      style.backdropFilter = 'blur(12px)';
      style.WebkitBackdropFilter = 'blur(12px)';
      style.border = '1px solid rgba(255, 255, 255, 0.2)';
    } else if (theme.button_style === 'outline') {
      style.backgroundColor = 'transparent';
      style.border = `2px solid ${theme.button_border_color || theme.text_color || '#ffffff'}`;
    } else {
      style.backgroundColor = theme.button_color || 'rgba(255, 255, 255, 0.1)';
      if (theme.button_border_color) {
        style.border = `1px solid ${theme.button_border_color}`;
      }
    }

    style.color = theme.button_text_color || theme.text_color || '#ffffff';
    return style;
  };

  const getRadiusClass = () => {
    switch (theme.button_style) {
      case 'rounded-none':
        return 'rounded-none';
      case 'rounded-md':
        return 'rounded-md';
      case 'rounded-full':
        return 'rounded-full';
      case 'rounded-xl':
      default:
        return 'rounded-xl';
    }
  };

  const platformInfo = link.platform ? PLATFORMS[link.platform] : null;

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      style={getButtonStyle()}
      className={`group w-full max-w-md p-4 flex items-center justify-between transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.99] mb-3 ${getRadiusClass()}`}
    >
      <div className="flex items-center gap-3 overflow-hidden">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
          style={{
            backgroundColor: platformInfo ? platformInfo.color + '22' : 'rgba(255, 255, 255, 0.15)',
            color: platformInfo ? platformInfo.color : theme.button_text_color || '#ffffff',
          }}
        >
          <PlatformIcon name={link.platform || link.icon || 'website'} className="w-5 h-5" />
        </div>
        <span className="font-semibold text-base truncate">{link.label}</span>
      </div>

      <ExternalLink className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
    </a>
  );
}
