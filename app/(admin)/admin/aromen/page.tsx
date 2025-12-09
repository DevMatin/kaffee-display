import { PageContainer } from '@/components/layout/PageContainer';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { getFlavorNotes } from '@/lib/queries';
import { FlavorNoteTable } from '@/components/admin/FlavorNoteTable';

export default async function AdminAromenPage() {
  const flavorNotes = await getFlavorNotes();

  return (
    <PageContainer>
      <div className="flex items-center justify-between mb-8">
        <h1>Aromen verwalten</h1>
        <Link href="/admin/aromen/neu">
          <Button>Neues Aroma</Button>
        </Link>
      </div>
      <FlavorNoteTable flavorNotes={flavorNotes} />
    </PageContainer>
  );
}


