import { notFound } from 'next/navigation';
import { PageContainer } from '@/components/layout/PageContainer';
import { RoastLevelForm } from '@/components/admin/RoastLevelForm';
import { getRoastLevels } from '@/lib/queries';
import { supabase } from '@/lib/supabase';

export default async function AdminRoestgradeEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const roastLevels = await getRoastLevels();

  const { data: roastLevel, error } = await supabase
    .from('roast_levels')
    .select(`
      *,
      translations:roast_levels_translations(locale, name, description)
    `)
    .eq('id', id)
    .single();

  if (error || !roastLevel) {
    notFound();
  }

  return (
    <PageContainer>
      <h1 className="mb-8">Röstgrad bearbeiten</h1>
      <RoastLevelForm roastLevel={roastLevel as any} />
    </PageContainer>
  );
}
