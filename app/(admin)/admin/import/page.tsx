import { PageContainer } from '@/components/layout/PageContainer';
import { CSVImportForm } from '@/components/admin/CSVImportForm';

export default function ImportPage() {
  return (
    <PageContainer>
      <h1 className="mb-4">CSV Import</h1>
      <p className="mb-6 text-[var(--color-text-secondary)]">
        Lade die WooCommerce-CSV (produkte.csv) hoch. Bestehende Produkte werden per Slug
        aktualisiert, neue angelegt.
      </p>
      <CSVImportForm />
    </PageContainer>
  );
}

