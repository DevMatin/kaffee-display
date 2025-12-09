import { PageContainer } from '@/components/layout/PageContainer';
import { RegionForm } from '@/components/admin/RegionForm';

export default function NewRegionPage() {
  return (
    <PageContainer>
      <h1 className="mb-8">Neue Region</h1>
      <RegionForm />
    </PageContainer>
  );
}


