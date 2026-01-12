import { PageContainer } from '@/components/layout/PageContainer';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { getRoastLevels } from '@/lib/queries';
import { RoastLevelTable } from '@/components/admin/RoastLevelTable';
import { getTranslations } from 'next-intl/server';
import type { RoastLevel } from '@/lib/types';

export default async function AdminRoestgradePage() {
  const t = await getTranslations('admin');
  let roastLevels: RoastLevel[] = [];
  try {
    roastLevels = await getRoastLevels();
  } catch (error) {
    roastLevels = [];
  }

  return (
    <PageContainer>
      <div className="flex items-center justify-between mb-8">
        <h1>Röstgrade verwalten</h1>
        <Link href="/admin/roestgrade/neu">
          <Button>Neuer Röstgrad</Button>
        </Link>
      </div>
      {roastLevels.length === 0 ? (
        <Card padding="lg">
          <div className="text-center py-12">
            <p className="text-[var(--color-text-secondary)] mb-4">
              Noch keine Röstgrade vorhanden.
            </p>
            <p className="text-sm text-[var(--color-text-muted)] mb-6">
              {roastLevels.length === 0 && 'Hinweis: Die Datenbank-Tabellen für Röstgrade wurden noch nicht erstellt. Bitte führe die Migration aus.'}
            </p>
            <Link href="/admin/roestgrade/neu">
              <Button>Ersten Röstgrad erstellen</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <RoastLevelTable roastLevels={roastLevels} />
      )}
    </PageContainer>
  );
}
