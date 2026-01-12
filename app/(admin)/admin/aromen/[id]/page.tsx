import { notFound } from 'next/navigation';
import { PageContainer } from '@/components/layout/PageContainer';
import { getFlavorCategories, getFlavorNotes } from '@/lib/queries';
import { FlavorNoteForm } from '@/components/admin/FlavorNoteForm';
import { getTranslations } from 'next-intl/server';

export default async function EditFlavorNotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = await getTranslations('admin');
  const [flavorNotes, categories] = await Promise.all([getFlavorNotes(), getFlavorCategories()]);
  const flavorNote = flavorNotes.find((fn) => fn.id === id);

  if (!flavorNote) {
    notFound();
  }

  return (
    <PageContainer>
      <h1 className="mb-8">{t('pages.editFlavor')}</h1>
      <FlavorNoteForm flavorNote={flavorNote} categories={categories} />
    </PageContainer>
  );
}


