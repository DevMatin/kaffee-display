'use client';

import { forwardRef, ReactNode } from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { children, padding = 'md', onClick, className = '', ...rest },
  ref
) {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      ref={ref}
      onClick={onClick}
      className={`bg-[var(--color-surface)] rounded-2xl ${paddingClasses[padding]} shadow-sm hover:shadow-lg transition-all ${
        onClick ? 'cursor-pointer hover:scale-[1.02]' : ''
      } ${className}`}
      style={{ boxShadow: 'var(--shadow-sm)' }}
      {...rest}
    >
      {children}
    </div>
  );
});

