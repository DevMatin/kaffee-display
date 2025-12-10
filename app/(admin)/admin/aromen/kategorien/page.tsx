import { PageContainer } from '@/components/layout/PageContainer';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { getFlavorCategories, getFlavorNotes } from '@/lib/queries';
import { FlavorCategoryTable } from '@/components/admin/FlavorCategoryTable';

export default async function FlavorCategoriesPage() {
  const [categories, flavorNotes] = await Promise.all([getFlavorCategories(), getFlavorNotes()]);

  return (
    <PageContainer>
      <div className="flex items-center justify-between mb-8">
        <h1>Aromen-Kategorien verwalten</h1>
        <Link href="/admin/aromen/kategorien/neu">
          <Button>Neue Kategorie</Button>
        </Link>
      </div>
      <FlavorCategoryTable categories={categories} flavorNotes={flavorNotes} />
    </PageContainer>
  );
}

