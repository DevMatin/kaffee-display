import { PageContainer } from '@/components/layout/PageContainer';
import { BrewMethodForm } from '@/components/admin/BrewMethodForm';

export default function NewBrewMethodPage() {
  return (
    <PageContainer>
      <h1 className="mb-8">Neue Zubereitung</h1>
      <BrewMethodForm />
    </PageContainer>
  );
}


