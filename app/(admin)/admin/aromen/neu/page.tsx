import { PageContainer } from '@/components/layout/PageContainer';
import { FlavorNoteForm } from '@/components/admin/FlavorNoteForm';
import { getFlavorCategories } from '@/lib/queries';
import { getTranslations } from 'next-intl/server';

export default async function NewFlavorNotePage() {
  const t = await getTranslations('admin');
  const categories = await getFlavorCategories();

  return (
    <PageContainer>
      <h1 className="mb-8">{t('pages.newFlavor')}</h1>
      <FlavorNoteForm categories={categories} />
    </PageContainer>
  );
}


