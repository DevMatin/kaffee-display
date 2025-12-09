import Link from 'next/link';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function NotFound() {
  return (
    <PageContainer>
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card padding="lg" className="text-center max-w-md">
          <h1 className="mb-4">404</h1>
          <p className="text-[var(--color-text-secondary)] mb-8">Die Seite wurde nicht gefunden.</p>
          <Link href="/">
            <Button>Zur Startseite</Button>
          </Link>
        </Card>
      </div>
    </PageContainer>
  );
}


