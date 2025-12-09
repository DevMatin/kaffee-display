'use client';

interface TextareaProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  required?: boolean;
}

export function Textarea({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
  className = '',
  required = false,
}: TextareaProps) {
  return (
    <div>
      {label && (
        <label className="block text-sm text-[var(--color-brown-light)] mb-3 font-medium">
          {label}
        </label>
      )}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        required={required}
        className={`w-full px-5 py-4 rounded-xl bg-[var(--color-cream)] border-2 border-[var(--color-beige)] text-[var(--color-espresso)] focus:outline-none focus:border-[var(--color-brown)] hover:border-[var(--color-brown-light)] transition-all resize-none ${className}`}
        style={{ fontSize: '1rem' }}
      />
    </div>
  );
}


