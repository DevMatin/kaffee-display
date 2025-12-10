import { notFound } from 'next/navigation';
import { PageContainer } from '@/components/layout/PageContainer';
import { getFlavorCategories, getFlavorCategoryById } from '@/lib/queries';
import { FlavorCategoryForm } from '@/components/admin/FlavorCategoryForm';

export default async function EditFlavorCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [categories, category] = await Promise.all([getFlavorCategories(), getFlavorCategoryById(id)]);

  if (!category) {
    notFound();
  }

  return (
    <PageContainer>
      <h1 className="mb-8">Aromen-Kategorie bearbeiten</h1>
      <FlavorCategoryForm category={category} categories={categories} />
    </PageContainer>
  );
}

