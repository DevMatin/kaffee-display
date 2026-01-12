import { PageContainer } from '@/components/layout/PageContainer';
import { FlavorCategoryForm } from '@/components/admin/FlavorCategoryForm';
import { getFlavorCategories } from '@/lib/queries';
import { getTranslations } from 'next-intl/server';

export default async function NewFlavorCategoryPage() {
  const t = await getTranslations('admin');
  const categories = await getFlavorCategories();

  return (
    <PageContainer>
      <h1 className="mb-8">{t('pages.newFlavorCategory')}</h1>
      <FlavorCategoryForm categories={categories} />
    </PageContainer>
  );
}

