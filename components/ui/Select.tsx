'use client';

interface SelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
  required?: boolean;
}

export function Select({ label, value, onChange, options, className = '', required = false }: SelectProps) {
  return (
    <div>
      {label && (
        <label className="block text-sm text-[var(--color-brown-light)] mb-3 font-medium">
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className={`w-full px-5 py-4 rounded-xl bg-[var(--color-cream)] border-2 border-[var(--color-beige)] text-[var(--color-espresso)] appearance-none cursor-pointer focus:outline-none focus:border-[var(--color-brown)] hover:border-[var(--color-brown-light)] transition-all ${className}`}
        style={{ fontSize: '1rem' }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}


