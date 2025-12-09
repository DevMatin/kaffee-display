import { PageContainer } from '@/components/layout/PageContainer';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { getBrewMethods } from '@/lib/queries';
import { BrewMethodTable } from '@/components/admin/BrewMethodTable';

export default async function AdminZubereitungenPage() {
  const brewMethods = await getBrewMethods();

  return (
    <PageContainer>
      <div className="flex items-center justify-between mb-8">
        <h1>Zubereitungen verwalten</h1>
        <Link href="/admin/zubereitungen/neu">
          <Button>Neue Zubereitung</Button>
        </Link>
      </div>
      <BrewMethodTable brewMethods={brewMethods} />
    </PageContainer>
  );
}


