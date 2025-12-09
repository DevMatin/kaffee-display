'use client';

import { ReactNode } from 'react';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  className?: string;
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  onClick,
  type = 'button',
  disabled = false,
  className = '',
}: ButtonProps) {
  const baseStyles = 'rounded-full transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-[var(--color-brown)] text-white hover:bg-[var(--color-brown-dark)]',
    secondary: 'bg-[var(--color-beige-light)] text-[var(--color-espresso)] hover:bg-[var(--color-beige)]',
    outline: 'bg-[var(--color-surface)] border-2 border-[var(--color-border)] text-[var(--color-espresso)] hover:border-[var(--color-brown)]',
  };

  const sizes = {
    sm: 'px-6 py-2 text-sm',
    md: 'px-8 py-3',
    lg: 'px-10 py-4 text-lg',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      style={{ boxShadow: 'var(--shadow-sm)' }}
    >
      {children}
    </button>
  );
}


