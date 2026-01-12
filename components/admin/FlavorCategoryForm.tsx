'use client';

import { useMemo, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { FlavorCategory } from '@/lib/types';
import { createFlavorCategory, updateFlavorCategory, deleteFlavorCategory } from '@/lib/mutations';
import { useTranslations } from 'next-intl';

interface FlavorCategoryFormProps {
  category?: FlavorCategory;
  categories: FlavorCategory[];
}

export function FlavorCategoryForm({ category, categories }: FlavorCategoryFormProps) {
  const t = useTranslations('admin.form');
  const tablesT = useTranslations('admin.tables');
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
    const options = [{ value: '', label: t('noParent') }];
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
      alert(t('saveCategoryError'));
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
      alert(t('deleteCategoryError'));
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <h2 className="mb-6">{t('categoryInfo')}</h2>
        <div className="space-y-4">
          <Input
            label={t('nameRequired')}
            value={formData.name}
            onChange={(value) => setFormData({ ...formData, name: value })}
            required
          />
          <Select
            label={`${t('level')} *`}
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
              { value: '1', label: t('level1') },
              { value: '2', label: t('level2') },
              { value: '3', label: t('level3') },
            ]}
            required
          />
          {formData.level !== '1' && (
            <Select
              label={t('parentCategory')}
              value={formData.parent_id}
              onChange={(value) => setFormData({ ...formData, parent_id: value })}
              options={parentOptions}
            />
          )}
          <Input
            label={t('colorHex')}
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
              {t('delete')}
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" onClick={handleDelete} disabled={loading}>
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
      {loading ? t('saveLoading') : category ? t('update') : t('create')}
        </Button>
      </div>
    </form>
  );
}

