'use client';

import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  color?: 'primary' | 'secondary' | 'accent';
  className?: string;
  style?: React.CSSProperties;
}

export function Badge({ children, color = 'primary', className = '', style }: BadgeProps) {
  const colors = {
    primary: 'bg-[var(--color-brown)] text-white',
    secondary: 'bg-[var(--color-beige-light)] text-[var(--color-espresso)]',
    accent: 'bg-[var(--color-accent-clay)] text-white',
  };

  return (
    <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-medium ${colors[color]} ${className}`} style={style}>
      {children}
    </span>
  );
}


