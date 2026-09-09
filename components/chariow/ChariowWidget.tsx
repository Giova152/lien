'use client';

import React, { useEffect, useRef } from 'react';
import { CHARIOW_STORE_DOMAIN } from '@/lib/chariow-constants';

declare global {
  interface Window {
    Chariow?: {
      initializeWidget?: (options?: any) => void;
    };
  }
}

interface ChariowWidgetProps {
  productId: string;
  storeDomain?: string;
  style?: 'tap' | 'frame' | 'modal';
  borderStyle?: 'rounded' | 'square';
  ctaWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'full';
  ctaAnimation?: 'pulse_glow' | 'none';
  locale?: 'fr' | 'en';
  primaryColor?: string;
  backgroundColor?: string;
  userEmail?: string | null;
  className?: string;
}

export function ChariowWidget({
  productId,
  storeDomain = CHARIOW_STORE_DOMAIN,
  style = 'tap',
  borderStyle = 'rounded',
  ctaWidth = 'xs',
  ctaAnimation = 'pulse_glow',
  locale = 'fr',
  primaryColor = '#4f39f6',
  backgroundColor = '#4f39f6',
  userEmail,
  className = '',
}: ChariowWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Injecter le CSS Chariow s'il n'est pas encore présent
    const existingLink = document.querySelector('link[href*="widget.min.css"]');
    if (!existingLink) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://js.chariowcdn.com/v1/widget.min.css';
      document.head.appendChild(link);
    }

    // 2. Injecter le script JS Chariow s'il n'est pas encore présent
    const existingScript = document.querySelector('script[src*="widget.min.js"]');
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = 'https://js.chariowcdn.com/v1/widget.min.js';
      script.async = true;
      script.onload = () => {
        window.Chariow?.initializeWidget?.();
      };
      document.head.appendChild(script);
    } else {
      // Si déjà chargé, réinitialiser pour le nouveau DOM
      window.Chariow?.initializeWidget?.();
    }
  }, [productId, storeDomain]);

  return (
    <div className={className}>
      <div
        ref={containerRef}
        id="chariow-widget"
        data-product-id={productId}
        data-store-domain={storeDomain}
        data-style={style}
        data-border-style={borderStyle}
        data-cta-width={ctaWidth}
        data-cta-animation={ctaAnimation}
        data-locale={locale}
        data-primary-color={primaryColor}
        data-background-color={backgroundColor}
        {...(userEmail ? { 'data-chw-email': userEmail } : {})}
      />
    </div>
  );
}

