import { PageContainer } from '@/components/layout/PageContainer';
import { BrewMethodForm } from '@/components/admin/BrewMethodForm';
import { getTranslations } from 'next-intl/server';

export default async function NewBrewMethodPage() {
  const t = await getTranslations('admin');
  return (
    <PageContainer>
      <h1 className="mb-8">{t('pages.newBrewMethod')}</h1>
      <BrewMethodForm />
    </PageContainer>
  );
}


