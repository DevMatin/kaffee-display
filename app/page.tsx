import Link from 'next/link';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function Home() {
  return (
    <PageContainer>
      <div className="text-center py-16">
        <h1 className="mb-6">Willkommen im Kaffee Katalog</h1>
        <p className="text-[var(--color-text-secondary)] mb-12 max-w-2xl mx-auto">
          Entdecke unsere Auswahl an Specialty Coffees aus verschiedenen Regionen der Welt.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/kaffees">
            <Button size="lg">Kaffees durchstöbern</Button>
          </Link>
          <Link href="/regionen">
            <Button variant="secondary" size="lg">
              Regionen erkunden
            </Button>
          </Link>
        </div>
      </div>
    </PageContainer>
  );
}

