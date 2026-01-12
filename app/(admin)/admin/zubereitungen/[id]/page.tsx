import { notFound } from 'next/navigation';
import { PageContainer } from '@/components/layout/PageContainer';
import { getBrewMethods } from '@/lib/queries';
import { BrewMethodForm } from '@/components/admin/BrewMethodForm';
import { getTranslations } from 'next-intl/server';

export default async function EditBrewMethodPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = await getTranslations('admin');
  const brewMethods = await getBrewMethods();
  const brewMethod = brewMethods.find((bm) => bm.id === id);

  if (!brewMethod) {
    notFound();
  }

  return (
    <PageContainer>
      <h1 className="mb-8">{t('pages.editBrewMethod')}</h1>
      <BrewMethodForm brewMethod={brewMethod} />
    </PageContainer>
  );
}


