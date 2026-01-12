import { PageContainer } from '@/components/layout/PageContainer';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { getFlavorNotes } from '@/lib/queries';
import { FlavorNoteTable } from '@/components/admin/FlavorNoteTable';
import { getTranslations } from 'next-intl/server';

export default async function AdminAromenPage() {
  const t = await getTranslations('admin');
  const flavorNotes = await getFlavorNotes();

  return (
    <PageContainer>
      <div className="flex items-center justify-between mb-8">
        <h1>{t('pages.manageFlavors')}</h1>
        <div className="flex gap-2">
          <Link href="/admin/aromen/kategorien">
            <Button variant="outline">{t('flavorCategories')}</Button>
          </Link>
          <Link href="/admin/aromen/neu">
            <Button>{t('pages.newFlavor')}</Button>
          </Link>
        </div>
      </div>
      <FlavorNoteTable flavorNotes={flavorNotes} />
    </PageContainer>
  );
}


