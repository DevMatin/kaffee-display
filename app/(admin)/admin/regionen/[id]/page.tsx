import { notFound } from 'next/navigation';
import { PageContainer } from '@/components/layout/PageContainer';
import { getRegionById } from '@/lib/queries';
import { RegionForm } from '@/components/admin/RegionForm';

export default async function EditRegionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const region = await getRegionById(id);

  if (!region) {
    notFound();
  }

  return (
    <PageContainer>
      <h1 className="mb-8">Region bearbeiten</h1>
      <RegionForm region={region} />
    </PageContainer>
  );
}


