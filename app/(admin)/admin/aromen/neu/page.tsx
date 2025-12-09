import { PageContainer } from '@/components/layout/PageContainer';
import { FlavorNoteForm } from '@/components/admin/FlavorNoteForm';

export default function NewFlavorNotePage() {
  return (
    <PageContainer>
      <h1 className="mb-8">Neues Aroma</h1>
      <FlavorNoteForm />
    </PageContainer>
  );
}


