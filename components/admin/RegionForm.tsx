'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { Region } from '@/lib/types';
import { createRegion, updateRegion, deleteRegion } from '@/lib/mutations';

interface RegionFormProps {
  region?: Region;
}

export function RegionForm({ region }: RegionFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [formData, setFormData] = useState({
    country: region?.country || '',
    region_name: region?.region_name || '',
    latitude: region?.latitude?.toString() || '',
    longitude: region?.longitude?.toString() || '',
    emblem_url: region?.emblem_url || '',
    description: region?.description || '',
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const regionData = {
        ...formData,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      };

      if (region) {
        await updateRegion(region.id, regionData);
      } else {
        await createRegion(regionData);
      }

      router.push('/admin/regionen');
      router.refresh();
    } catch (error) {
      console.error('Error saving region:', error);
      alert('Fehler beim Speichern der Region');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!region) return;

    setLoading(true);
    try {
      await deleteRegion(region.id);
      router.push('/admin/regionen');
      router.refresh();
    } catch (error) {
      console.error('Error deleting region:', error);
      alert('Fehler beim Löschen der Region');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <h2 className="mb-6">Region-Informationen</h2>
        <div className="space-y-4">
          <Input
            label="Land *"
            value={formData.country}
            onChange={(value) => setFormData({ ...formData, country: value })}
            required
          />
          <Input
            label="Region *"
            value={formData.region_name}
            onChange={(value) => setFormData({ ...formData, region_name: value })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Breitengrad"
              type="number"
              step="any"
              value={formData.latitude}
              onChange={(value) => setFormData({ ...formData, latitude: value })}
            />
            <Input
              label="Längengrad"
              type="number"
              step="any"
              value={formData.longitude}
              onChange={(value) => setFormData({ ...formData, longitude: value })}
            />
          </div>
          <Input
            label="Emblem URL"
            value={formData.emblem_url}
            onChange={(value) => setFormData({ ...formData, emblem_url: value })}
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
          {region && (
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
          {loading ? 'Speichern...' : region ? 'Aktualisieren' : 'Erstellen'}
        </Button>
      </div>
    </form>
  );
}


