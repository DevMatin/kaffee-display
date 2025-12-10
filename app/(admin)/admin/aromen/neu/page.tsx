import { PageContainer } from '@/components/layout/PageContainer';
import { FlavorNoteForm } from '@/components/admin/FlavorNoteForm';
import { getFlavorCategories } from '@/lib/queries';

export default async function NewFlavorNotePage() {
  const categories = await getFlavorCategories();

  return (
    <PageContainer>
      <h1 className="mb-8">Neues Aroma</h1>
      <FlavorNoteForm categories={categories} />
    </PageContainer>
  );
}


