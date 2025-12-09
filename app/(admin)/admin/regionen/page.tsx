import { PageContainer } from '@/components/layout/PageContainer';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { getRegions } from '@/lib/queries';
import { RegionTable } from '@/components/admin/RegionTable';

export default async function AdminRegionenPage() {
  const regions = await getRegions();

  return (
    <PageContainer>
      <div className="flex items-center justify-between mb-8">
        <h1>Regionen verwalten</h1>
        <Link href="/admin/regionen/neu">
          <Button>Neue Region</Button>
        </Link>
      </div>
      <RegionTable regions={regions} />
    </PageContainer>
  );
}


