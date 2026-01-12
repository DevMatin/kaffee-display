import { notFound } from 'next/navigation';
import { PageContainer } from '@/components/layout/PageContainer';
import { getRegionById } from '@/lib/queries';
import { RegionForm } from '@/components/admin/RegionForm';
import { getTranslations } from 'next-intl/server';

export default async function EditRegionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = await getTranslations('admin');
  const region = await getRegionById(id);

  if (!region) {
    notFound();
  }

  return (
    <PageContainer>
      <h1 className="mb-8">{t('pages.editRegion')}</h1>
      <RegionForm region={region} />
    </PageContainer>
  );
}


