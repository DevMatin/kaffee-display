import { PageContainer } from '@/components/layout/PageContainer';
import { FlavorCategoryForm } from '@/components/admin/FlavorCategoryForm';
import { getFlavorCategories } from '@/lib/queries';

export default async function NewFlavorCategoryPage() {
  const categories = await getFlavorCategories();

  return (
    <PageContainer>
      <h1 className="mb-8">Neue Aromen-Kategorie</h1>
      <FlavorCategoryForm categories={categories} />
    </PageContainer>
  );
}

