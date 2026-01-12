'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { RoastLevel, RoastLevelTranslation } from '@/lib/types';
import { createRoastLevel, updateRoastLevel, deleteRoastLevel } from '@/lib/mutations';
import { useTranslations } from 'next-intl';

interface RoastLevelFormProps {
  roastLevel?: RoastLevel & { translations?: RoastLevelTranslation[] };
}

export function RoastLevelForm({ roastLevel }: RoastLevelFormProps) {
  const t = useTranslations('admin.form');
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [formData, setFormData] = useState({
    name: roastLevel?.name || '',
  });

  const [translations, setTranslations] = useState<{ de: { name: string; description: string }; en: { name: string; description: string } }>({
    de: {
      name: roastLevel?.translations?.find((t) => t.locale === 'de')?.name || '',
      description: roastLevel?.translations?.find((t) => t.locale === 'de')?.description || '',
    },
    en: {
      name: roastLevel?.translations?.find((t) => t.locale === 'en')?.name || '',
      description: roastLevel?.translations?.find((t) => t.locale === 'en')?.description || '',
    },
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const translationData: RoastLevelTranslation[] = [
        {
          locale: 'de',
          name: translations.de.name || null,
          description: translations.de.description || null,
        },
        {
          locale: 'en',
          name: translations.en.name || null,
          description: translations.en.description || null,
        },
      ];

      if (roastLevel) {
        await updateRoastLevel(roastLevel.id, formData, translationData);
      } else {
        await createRoastLevel(formData, translationData);
      }

      router.push('/admin/roestgrade');
      router.refresh();
    } catch (error) {
      console.error('Error saving roast level:', error);
      alert('Fehler beim Speichern des Röstgrads');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!roastLevel) return;

    setLoading(true);
    try {
      await deleteRoastLevel(roastLevel.id);
      router.push('/admin/roestgrade');
      router.refresh();
    } catch (error) {
      console.error('Error deleting roast level:', error);
      alert('Fehler beim Löschen des Röstgrads');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <h2 className="mb-6">Röstgrad-Informationen</h2>
        <div className="space-y-4">
          <Input
            label="Name (Intern)"
            value={formData.name}
            onChange={(value) => setFormData({ ...formData, name: value })}
            required
            placeholder="z.B. light, medium, dark, omni"
          />
        </div>
      </Card>

      <Card className="mt-6">
        <h2 className="mb-6">Übersetzungen</h2>
        <div className="space-y-6">
          <div>
            <h3 className="mb-4 text-lg font-medium">Deutsch</h3>
            <div className="space-y-4">
              <Input
                label="Name (DE)"
                value={translations.de.name}
                onChange={(value) => setTranslations({ ...translations, de: { ...translations.de, name: value } })}
                placeholder="z.B. Hell, Mittel, Dunkel, Omniröstung"
              />
              <Textarea
                label="Beschreibung (DE)"
                value={translations.de.description}
                onChange={(value) => setTranslations({ ...translations, de: { ...translations.de, description: value } })}
                placeholder="Erklärung des Röstgrads..."
                rows={4}
              />
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-medium">English</h3>
            <div className="space-y-4">
              <Input
                label="Name (EN)"
                value={translations.en.name}
                onChange={(value) => setTranslations({ ...translations, en: { ...translations.en, name: value } })}
                placeholder="e.g. Light, Medium, Dark, Omni-roast"
              />
              <Textarea
                label="Description (EN)"
                value={translations.en.description}
                onChange={(value) => setTranslations({ ...translations, en: { ...translations.en, description: value } })}
                placeholder="Explanation of the roast level..."
                rows={4}
              />
            </div>
          </div>
        </div>
      </Card>

      <div className="flex items-center justify-between mt-8">
        <div>
          {roastLevel && (
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
          {loading ? t('saveLoading') : roastLevel ? t('update') : t('create')}
        </Button>
      </div>
    </form>
  );
}
