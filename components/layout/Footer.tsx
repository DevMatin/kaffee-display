import { Link } from '@/lib/i18n-utils';
import { useTranslations } from 'next-intl';

export function Footer() {
  const t = useTranslations('footer');
  return (
    <footer className="bg-[var(--color-beige-light)] border-t-2 border-[var(--color-beige)] mt-auto">
      <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between gap-3 flex-wrap">
        <p className="text-[var(--color-text-secondary)] text-sm">
          {t('copyright', { year: new Date().getFullYear() })}
        </p>
        <Link
          href="/admin"
          className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-espresso)] transition-colors"
        >
          {t('admin')}
        </Link>
      </div>
    </footer>
  );
}


