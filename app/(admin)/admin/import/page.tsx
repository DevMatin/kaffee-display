import { PageContainer } from '@/components/layout/PageContainer';
import { CSVImportForm } from '@/components/admin/CSVImportForm';
import { getTranslations } from 'next-intl/server';

export default async function ImportPage() {
  const t = await getTranslations('csvImport');
  return (
    <PageContainer>
      <h1 className="mb-4">{t('title')}</h1>
      <p className="mb-6 text-[var(--color-text-secondary)]">{t('description')}</p>
      <CSVImportForm />
    </PageContainer>
  );
}

