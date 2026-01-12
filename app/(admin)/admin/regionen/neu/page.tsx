import { PageContainer } from '@/components/layout/PageContainer';
import { RegionForm } from '@/components/admin/RegionForm';
import { getTranslations } from 'next-intl/server';

export default async function NewRegionPage() {
  const t = await getTranslations('admin');
  return (
    <PageContainer>
      <h1 className="mb-8">{t('pages.newRegion')}</h1>
      <RegionForm />
    </PageContainer>
  );
}


