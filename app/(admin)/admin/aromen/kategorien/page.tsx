import { PageContainer } from '@/components/layout/PageContainer';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { getFlavorCategories, getFlavorNotes } from '@/lib/queries';
import { FlavorCategoryTable } from '@/components/admin/FlavorCategoryTable';
import { getTranslations } from 'next-intl/server';

export default async function FlavorCategoriesPage() {
  const t = await getTranslations('admin');
  const [categories, flavorNotes] = await Promise.all([getFlavorCategories(), getFlavorNotes()]);

  return (
    <PageContainer>
      <div className="flex items-center justify-between mb-8">
        <h1>{t('pages.manageFlavorCategories')}</h1>
        <Link href="/admin/aromen/kategorien/neu">
          <Button>{t('pages.newFlavorCategory')}</Button>
        </Link>
      </div>
      <FlavorCategoryTable categories={categories} flavorNotes={flavorNotes} />
    </PageContainer>
  );
}

