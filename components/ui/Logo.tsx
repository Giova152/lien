import React from 'react';
import Link from 'next/link';

interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showBadge?: boolean;
  textClassName?: string;
  className?: string;
  href?: string;
  variant?: 'gradient' | 'dark' | 'light';
}

const SIZE_MAP = {
  xs: { icon: 'w-6 h-6', radius: 'rounded-lg', font: 'text-sm', badge: 'text-[9px]' },
  sm: { icon: 'w-8 h-8', radius: 'rounded-xl', font: 'text-base', badge: 'text-[10px]' },
  md: { icon: 'w-9 h-9', radius: 'rounded-xl', font: 'text-xl', badge: 'text-[11px]' },
  lg: { icon: 'w-11 h-11', radius: 'rounded-2xl', font: 'text-2xl', badge: 'text-xs' },
  xl: { icon: 'w-14 h-14', radius: 'rounded-2xl', font: 'text-3xl', badge: 'text-xs' },
};

export function LogoIcon({
  size = 'md',
  variant = 'gradient',
  className = '',
}: {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'gradient' | 'dark' | 'light';
  className?: string;
}) {
  const config = SIZE_MAP[size] || SIZE_MAP.md;

  const bgStyles = {
    gradient: 'bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 shadow-sm ring-1 ring-black/5',
    dark: 'bg-neutral-900 shadow-sm ring-1 ring-white/10',
    light: 'bg-white shadow-sm ring-1 ring-neutral-200/80',
  }[variant];

  const fillStyle = variant === 'light' ? '#4F46E5' : '#FFFFFF';
  const secondaryFill = variant === 'light' ? '#818CF8' : 'rgba(255, 255, 255, 0.88)';

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${config.icon} ${config.radius} ${bgStyles} overflow-hidden transition-transform duration-200 group-hover:scale-105 ${className}`}
    >
      {/* Top subtle inner sheen */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/10 pointer-events-none" />

      {/* Modern Clean LB Monogram Vector */}
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-[74%] h-[74%] relative z-10"
      >
        <defs>
          <linearGradient id="lb-inner-glow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={fillStyle} />
            <stop offset="100%" stopColor={secondaryFill} />
          </linearGradient>
        </defs>

        {/* Letter 'L' (Modern Bold Geometric Stem + Intersecting Base) */}
        <path
          d="M20 20 H32 V63 C32 65.8 34.2 68 37 68 H52 L48 78 H28 C23.6 78 20 74.4 20 70 V20 Z"
          fill="url(#lb-inner-glow)"
        />

        {/* Letter 'B' (Interlocking Precision Upper & Lower Arches) */}
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M40 20 H64 C73.4 20 80 26.6 80 35.5 C80 41.5 76 46.2 70 48 C77 49.8 82 55.2 82 62.5 C82 71.5 74.6 78 64 78 H54 L58 68 H63.5 C68.5 68 72 65.2 72 61 C72 56.8 68.5 54 63 54 H49 V44 H62.5 C67 44 70 41.2 70 37 C70 32.8 67 30 62.5 30 H49 V68 L40 68 V20 Z"
          fill="url(#lb-inner-glow)"
        />
      </svg>
    </div>
  );
}

export function Logo({
  size = 'md',
  showText = true,
  showBadge = false,
  textClassName = '',
  className = '',
  href,
  variant = 'gradient',
}: LogoProps) {
  const config = SIZE_MAP[size] || SIZE_MAP.md;

  const content = (
    <div className={`inline-flex items-center gap-2.5 group cursor-pointer select-none ${className}`}>
      <LogoIcon size={size} variant={variant} />
      {showText && (
        <div className="flex items-center gap-1.5 font-sans leading-none">
          <span className={`font-black tracking-tight text-neutral-900 ${config.font} ${textClassName}`}>
            Lien<span className="text-indigo-600 font-black">-Bio</span>
          </span>
          {showBadge && (
            <span className={`px-1.5 py-0.5 rounded-md bg-indigo-50 border border-indigo-100/80 font-black text-indigo-600 tracking-wider uppercase ${config.badge}`}>
              LB
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center">
        {content}
      </Link>
    );
  }

  return content;
}
