'use client';

interface InputProps {
  label?: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  step?: string;
}

export function Input({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  className = '',
  required = false,
  disabled = false,
  step,
}: InputProps) {
  return (
    <div>
      {label && (
        <label className="block text-sm text-[var(--color-brown-light)] mb-3 font-medium">
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        step={step}
        className={`w-full px-5 py-4 rounded-xl bg-[var(--color-cream)] border-2 border-[var(--color-beige)] text-[var(--color-espresso)] focus:outline-none focus:border-[var(--color-brown)] hover:border-[var(--color-brown-light)] transition-all ${className}`}
        style={{ fontSize: '1rem' }}
      />
    </div>
  );
}


