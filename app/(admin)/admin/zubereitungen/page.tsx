import { PageContainer } from '@/components/layout/PageContainer';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { getBrewMethods } from '@/lib/queries';
import { BrewMethodTable } from '@/components/admin/BrewMethodTable';
import { getTranslations } from 'next-intl/server';

export default async function AdminZubereitungenPage() {
  const t = await getTranslations('admin');
  const brewMethods = await getBrewMethods();

  return (
    <PageContainer>
      <div className="flex items-center justify-between mb-8">
        <h1>{t('pages.manageBrewMethods')}</h1>
        <Link href="/admin/zubereitungen/neu">
          <Button>{t('pages.newBrewMethod')}</Button>
        </Link>
      </div>
      <BrewMethodTable brewMethods={brewMethods} />
    </PageContainer>
  );
}


