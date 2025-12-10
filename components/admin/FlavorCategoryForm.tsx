'use client';

import { useMemo, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { FlavorCategory } from '@/lib/types';
import { createFlavorCategory, updateFlavorCategory, deleteFlavorCategory } from '@/lib/mutations';

interface FlavorCategoryFormProps {
  category?: FlavorCategory;
  categories: FlavorCategory[];
}

export function FlavorCategoryForm({ category, categories }: FlavorCategoryFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [formData, setFormData] = useState({
    name: category?.name || '',
    level: category?.level?.toString() || '1',
    parent_id: category?.parent_id || '',
    color_hex: category?.color_hex || '',
  });

  const parentOptions = useMemo(() => {
    const currentId = category?.id;
    const options = [{ value: '', label: 'Keine übergeordnete Kategorie' }];
    categories
      .filter((c) => c.id !== currentId)
      .forEach((c) => {
        const prefix = c.parent ? `${c.parent.name} → ` : '';
        options.push({ value: c.id, label: `${prefix}${c.name}` });
      });
    return options;
  }, [categories, category?.id]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name: formData.name.trim(),
        level: Number(formData.level),
        parent_id: formData.level === '1' ? null : formData.parent_id || null,
        color_hex: formData.color_hex || null,
      };

      if (category) {
        await updateFlavorCategory(category.id, payload);
      } else {
        await createFlavorCategory(payload);
      }

      router.push('/admin/aromen/kategorien');
      router.refresh();
    } catch (error) {
      console.error('Error saving flavor category:', error);
      alert('Fehler beim Speichern der Kategorie');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!category) return;

    setLoading(true);
    try {
      await deleteFlavorCategory(category.id);
      router.push('/admin/aromen/kategorien');
      router.refresh();
    } catch (error) {
      console.error('Error deleting flavor category:', error);
      alert('Fehler beim Löschen der Kategorie');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <h2 className="mb-6">Kategorie-Informationen</h2>
        <div className="space-y-4">
          <Input
            label="Name *"
            value={formData.name}
            onChange={(value) => setFormData({ ...formData, name: value })}
            required
          />
          <Select
            label="Ebene *"
            value={formData.level}
            onChange={(value) => {
              const nextLevel = value;
              setFormData((prev) => ({
                ...prev,
                level: nextLevel,
                parent_id: nextLevel === '1' ? '' : prev.parent_id,
              }));
            }}
            options={[
              { value: '1', label: '1 (Hauptebene)' },
              { value: '2', label: '2 (Unterkategorie)' },
              { value: '3', label: '3 (Detailkategorie)' },
            ]}
            required
          />
          {formData.level !== '1' && (
            <Select
              label="Überkategorie"
              value={formData.parent_id}
              onChange={(value) => setFormData({ ...formData, parent_id: value })}
              options={parentOptions}
            />
          )}
          <Input
            label="Farbe (HEX, optional)"
            value={formData.color_hex || ''}
            onChange={(value) => setFormData({ ...formData, color_hex: value })}
            placeholder="#aabbcc"
          />
        </div>
      </Card>

      <div className="flex items-center justify-between mt-8">
        <div>
          {category && (
            <>
              {!showDeleteConfirm ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={loading}
                >
                  Löschen
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" onClick={handleDelete} disabled={loading}>
                    Wirklich löschen?
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={loading}
                  >
                    Abbrechen
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? 'Speichern...' : category ? 'Aktualisieren' : 'Erstellen'}
        </Button>
      </div>
    </form>
  );
}

