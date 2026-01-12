'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import type { FlavorCategory, FlavorNote } from '@/lib/types';
import { createFlavorNote, updateFlavorNote, deleteFlavorNote } from '@/lib/mutations';
import { useTranslations } from 'next-intl';

interface FlavorNoteFormProps {
  flavorNote?: FlavorNote;
  categories?: FlavorCategory[];
}

export function FlavorNoteForm({ flavorNote, categories = [] }: FlavorNoteFormProps) {
  const t = useTranslations('admin.form');
  const tablesT = useTranslations('admin.tables');
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [formData, setFormData] = useState({
    name: flavorNote?.name || '',
    icon_url: flavorNote?.icon_url || '',
    description: flavorNote?.description || '',
    category_id: flavorNote?.category_id || '',
  });

  const categoryOptions = (() => {
    const map = new Map<string, FlavorCategory>();
    categories.forEach((cat) => map.set(cat.id, cat));

    const labelFor = (cat: FlavorCategory): string => {
      const names: string[] = [];
      let current: FlavorCategory | undefined | null = cat;
      let guard = 0;
      while (current && guard < 10) {
        names.unshift(current.name);
        current = current.parent_id ? map.get(current.parent_id) || null : null;
        guard += 1;
      }
      return names.join(' → ');
    };

    return [
      { value: '', label: tablesT('uncategorized') },
      ...categories
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((cat) => ({
          value: cat.id,
          label: labelFor(cat),
        })),
    ];
  })();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (flavorNote) {
        await updateFlavorNote(flavorNote.id, {
          ...formData,
          category_id: formData.category_id || null,
        });
      } else {
        await createFlavorNote({
          ...formData,
          category_id: formData.category_id || null,
        });
      }

      router.push('/admin/aromen');
      router.refresh();
    } catch (error) {
      console.error('Error saving flavor note:', error);
      alert(t('saveFlavorError'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!flavorNote) return;

    setLoading(true);
    try {
      await deleteFlavorNote(flavorNote.id);
      router.push('/admin/aromen');
      router.refresh();
    } catch (error) {
      console.error('Error deleting flavor note:', error);
      alert(t('deleteFlavorError'));
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <h2 className="mb-6">{t('flavorNotes')}</h2>
        <div className="space-y-4">
          <Input
            label={t('nameRequired')}
            value={formData.name}
            onChange={(value) => setFormData({ ...formData, name: value })}
            required
          />
          <Input
            label="Icon URL"
            value={formData.icon_url}
            onChange={(value) => setFormData({ ...formData, icon_url: value })}
            placeholder="https://..."
          />
          <Textarea
            label={t('description')}
            value={formData.description}
            onChange={(value) => setFormData({ ...formData, description: value })}
            rows={4}
          />
          <Select
            label={tablesT('category')}
            value={formData.category_id || ''}
            onChange={(value) => setFormData({ ...formData, category_id: value })}
            options={categoryOptions}
          />
        </div>
      </Card>

      <div className="flex items-center justify-between mt-8">
        <div>
          {flavorNote && (
            <>
              {!showDeleteConfirm ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={loading}
                >
              {t('delete')}
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleDelete}
                    disabled={loading}
                  >
                {t('confirmDelete')}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={loading}
                  >
                {t('cancel')}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
        <Button type="submit" disabled={loading}>
      {loading ? t('saveLoading') : flavorNote ? t('update') : t('create')}
        </Button>
      </div>
    </form>
  );
}


