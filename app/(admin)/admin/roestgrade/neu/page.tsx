import { PageContainer } from '@/components/layout/PageContainer';
import { RoastLevelForm } from '@/components/admin/RoastLevelForm';

export default function AdminRoestgradeNeuPage() {
  return (
    <PageContainer>
      <h1 className="mb-8">Neuer Röstgrad</h1>
      <RoastLevelForm />
    </PageContainer>
  );
}
