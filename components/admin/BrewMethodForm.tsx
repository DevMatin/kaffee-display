'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { BrewMethod } from '@/lib/types';
import { createBrewMethod, updateBrewMethod, deleteBrewMethod } from '@/lib/mutations';

interface BrewMethodFormProps {
  brewMethod?: BrewMethod;
}

export function BrewMethodForm({ brewMethod }: BrewMethodFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [formData, setFormData] = useState({
    name: brewMethod?.name || '',
    icon_url: brewMethod?.icon_url || '',
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (brewMethod) {
        await updateBrewMethod(brewMethod.id, formData);
      } else {
        await createBrewMethod(formData);
      }

      router.push('/admin/zubereitungen');
      router.refresh();
    } catch (error) {
      console.error('Error saving brew method:', error);
      alert('Fehler beim Speichern der Zubereitung');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!brewMethod) return;

    setLoading(true);
    try {
      await deleteBrewMethod(brewMethod.id);
      router.push('/admin/zubereitungen');
      router.refresh();
    } catch (error) {
      console.error('Error deleting brew method:', error);
      alert('Fehler beim Löschen der Zubereitung');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <h2 className="mb-6">Zubereitung-Informationen</h2>
        <div className="space-y-4">
          <Input
            label="Name *"
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
        </div>
      </Card>

      <div className="flex items-center justify-between mt-8">
        <div>
          {brewMethod && (
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
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleDelete}
                    disabled={loading}
                  >
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
          {loading ? 'Speichern...' : brewMethod ? 'Aktualisieren' : 'Erstellen'}
        </Button>
      </div>
    </form>
  );
}


