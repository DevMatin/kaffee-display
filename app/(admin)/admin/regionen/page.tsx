import { PageContainer } from '@/components/layout/PageContainer';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { getRegions } from '@/lib/queries';
import { RegionTable } from '@/components/admin/RegionTable';
import { getTranslations } from 'next-intl/server';

export default async function AdminRegionenPage() {
  const t = await getTranslations('admin');
  const regions = await getRegions();

  return (
    <PageContainer>
      <div className="flex items-center justify-between mb-8">
        <h1>{t('pages.manageRegions')}</h1>
        <Link href="/admin/regionen/neu">
          <Button>{t('pages.newRegion')}</Button>
        </Link>
      </div>
      <RegionTable regions={regions} />
    </PageContainer>
  );
}


