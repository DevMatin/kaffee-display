'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { FlavorNote } from '@/lib/types';
import { createFlavorNote, updateFlavorNote, deleteFlavorNote } from '@/lib/mutations';

interface FlavorNoteFormProps {
  flavorNote?: FlavorNote;
}

export function FlavorNoteForm({ flavorNote }: FlavorNoteFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [formData, setFormData] = useState({
    name: flavorNote?.name || '',
    icon_url: flavorNote?.icon_url || '',
    description: flavorNote?.description || '',
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (flavorNote) {
        await updateFlavorNote(flavorNote.id, formData);
      } else {
        await createFlavorNote(formData);
      }

      router.push('/admin/aromen');
      router.refresh();
    } catch (error) {
      console.error('Error saving flavor note:', error);
      alert('Fehler beim Speichern des Aromas');
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
      alert('Fehler beim Löschen des Aromas');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <h2 className="mb-6">Aroma-Informationen</h2>
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
          <Textarea
            label="Beschreibung"
            value={formData.description}
            onChange={(value) => setFormData({ ...formData, description: value })}
            rows={4}
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
          {loading ? 'Speichern...' : flavorNote ? 'Aktualisieren' : 'Erstellen'}
        </Button>
      </div>
    </form>
  );
}


