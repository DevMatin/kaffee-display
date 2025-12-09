import { PageContainer } from '@/components/layout/PageContainer';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { getCoffees } from '@/lib/queries';
import { CoffeeTable } from '@/components/admin/CoffeeTable';

export const revalidate = 0; // Kein Caching für diese Seite

export default async function AdminKaffeesPage() {
  const coffees = await getCoffees();

  return (
    <PageContainer>
      <div className="flex items-center justify-between mb-8">
        <h1>Kaffees verwalten</h1>
        <Link href="/admin/kaffees/neu">
          <Button>Neuer Kaffee</Button>
        </Link>
      </div>
      <CoffeeTable coffees={coffees} />
    </PageContainer>
  );
}

