'use client';

import { useState, FormEvent, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { Coffee, Region, FlavorNote, BrewMethod, FlavorCategory } from '@/lib/types';
import { createCoffee, updateCoffee, manageCoffeeFlavorNotes, manageCoffeeBrewMethods, deleteCoffee } from '@/lib/mutations';
import { uploadImage, deleteImage } from '@/lib/storage';

interface CoffeeFormProps {
  coffee?: Coffee;
  regions: Region[];
  flavorNotes: FlavorNote[];
  brewMethods: BrewMethod[];
}

export function CoffeeForm({ coffee, regions, flavorNotes, brewMethods }: CoffeeFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(coffee?.image_url || null);
  const [oldImageUrl, setOldImageUrl] = useState<string | null>(coffee?.image_url || null);
  const [isDragging, setIsDragging] = useState(false);

  const [formData, setFormData] = useState({
    name: coffee?.name || '',
    short_description: coffee?.short_description || '',
    description: coffee?.description || '',
    roast_level: coffee?.roast_level || '',
    processing_method: coffee?.processing_method || '',
    varietal: coffee?.varietal || '',
    altitude_min: coffee?.altitude_min?.toString() || '',
    altitude_max: coffee?.altitude_max?.toString() || '',
    country: coffee?.country || '',
    region_id: coffee?.region_id || '',
    image_url: coffee?.image_url || '',
  });

  const [selectedFlavorNotes, setSelectedFlavorNotes] = useState<string[]>(
    coffee?.flavor_notes?.map((fn) => fn.id) || []
  );
  const [selectedBrewMethods, setSelectedBrewMethods] = useState<string[]>(
    coffee?.brew_methods?.map((bm) => bm.id) || []
  );
  const [selectedRegions, setSelectedRegions] = useState<string[]>(
    coffee?.regions?.map((r) => r.id) || (coffee?.region_id ? [coffee.region_id] : [''])
  );

  const regionOptions = [
    { value: '', label: 'Keine Region' },
    ...regions.map((r) => ({ value: r.id, label: `${r.region_name}, ${r.country}` })),
  ];

  const updateRegionAt = (index: number, value: string) => {
    const next = [...selectedRegions];
    next[index] = value;
    setSelectedRegions(next);
  };

  const addRegionRow = () => {
    setSelectedRegions((prev) => [...prev, '']);
  };

  const removeRegionRow = (index: number) => {
    setSelectedRegions((prev) => {
      if (prev.length === 1) return [''];
      const next = [...prev];
      next.splice(index, 1);
      return next;
    });
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Bitte wählen Sie eine Bilddatei aus');
      return;
    }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalImageUrl = formData.image_url;

      if (selectedFile) {
        try {
          console.log('Uploading image...', { fileName: selectedFile.name, size: selectedFile.size });
          const uploadedUrl = await uploadImage(selectedFile, 'coffees');
          console.log('Image uploaded successfully, URL:', uploadedUrl);
          finalImageUrl = uploadedUrl;

          if (oldImageUrl && oldImageUrl !== uploadedUrl) {
            try {
              await deleteImage(oldImageUrl);
            } catch (error) {
              console.error('Error deleting old image:', error);
            }
          }
        } catch (error: any) {
          console.error('Error uploading image:', error);
          const errorMessage = error?.message || 'Unbekannter Fehler beim Hochladen';
          alert(`Fehler beim Hochladen des Bildes: ${errorMessage}\n\nMögliche Ursachen:\n- Storage-Bucket "images" existiert nicht\n- Fehlende Berechtigungen\n- Datei zu groß`);
          setLoading(false);
          return;
        }
      }

      console.log('=== SAVING COFFEE ===');
      console.log('1. Final image URL (from upload or form):', finalImageUrl);
      console.log('2. Form data image_url:', formData.image_url);
      console.log('3. Selected file:', selectedFile ? selectedFile.name : 'none');

      const regionIds = selectedRegions.filter((id) => id);
      const coffeeData = {
        name: formData.name,
        short_description: formData.short_description || null,
        description: formData.description || null,
        roast_level: formData.roast_level || null,
        processing_method: formData.processing_method || null,
        varietal: formData.varietal || null,
        altitude_min: formData.altitude_min ? parseInt(formData.altitude_min) : null,
        altitude_max: formData.altitude_max ? parseInt(formData.altitude_max) : null,
        country: formData.country || null,
        region_id: regionIds[0] || null,
        image_url: finalImageUrl || null,
      };

      console.log('4. Coffee data to save:', JSON.stringify(coffeeData, null, 2));
      console.log('5. Image URL in coffeeData:', coffeeData.image_url);

      let coffeeId: string;

      if (coffee) {
        console.log('Updating coffee:', coffee.id);
        const updated = await updateCoffee(coffee.id, coffeeData, regionIds);
        console.log('Coffee updated, returned data:', updated);
        console.log('Image URL in updated coffee:', updated.image_url);
        coffeeId = coffee.id;
      } else {
        console.log('Creating new coffee');
        const newCoffee = await createCoffee(coffeeData, regionIds);
        console.log('Coffee created, returned data:', newCoffee);
        console.log('Image URL in new coffee:', newCoffee.image_url);
        coffeeId = newCoffee.id;
      }

      await Promise.all([
        manageCoffeeFlavorNotes(coffeeId, selectedFlavorNotes),
        manageCoffeeBrewMethods(coffeeId, selectedBrewMethods),
      ]);

      console.log('Redirecting to admin page...');
      
      // Hard refresh um Cache zu umgehen
      window.location.href = '/admin/kaffees';
    } catch (error: any) {
      console.error('Error saving coffee:', error);
      const errorMessage = error?.message || 'Unbekannter Fehler';
      alert(`Fehler beim Speichern des Kaffees: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!coffee) return;

    setLoading(true);
    try {
      await deleteCoffee(coffee.id);
      router.push('/admin/kaffees');
      router.refresh();
    } catch (error) {
      console.error('Error deleting coffee:', error);
      alert('Fehler beim Löschen des Kaffees');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card>
          <h2 className="mb-6">Grundinformationen</h2>
          <div className="space-y-4">
            <Input
              label="Name *"
              value={formData.name}
              onChange={(value) => setFormData({ ...formData, name: value })}
              required
            />
            <Input
              label="Kurzbeschreibung"
              value={formData.short_description}
              onChange={(value) => setFormData({ ...formData, short_description: value })}
            />
            <Textarea
              label="Beschreibung"
              value={formData.description}
              onChange={(value) => setFormData({ ...formData, description: value })}
              rows={6}
            />
            <div>
              <label className="block text-sm text-[var(--color-brown-light)] mb-3 font-medium">
                Hauptbild
              </label>
              {imagePreview && (
                <div className="mb-4 relative w-full h-48 rounded-xl overflow-hidden border-2 border-[var(--color-beige)]">
                  <Image
                    src={imagePreview}
                    alt="Vorschau"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              )}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                  isDragging
                    ? 'border-[var(--color-brown)] bg-[var(--color-beige-light)]'
                    : 'border-[var(--color-beige)] bg-[var(--color-cream)] hover:border-[var(--color-brown-light)]'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="space-y-4">
                  <div className="text-[var(--color-text-secondary)]">
                    <p className="text-lg font-medium mb-2">
                      {isDragging ? 'Bild hier ablegen' : 'Bild per Drag & Drop hier ablegen'}
                    </p>
                    <p className="text-sm">oder</p>
                  </div>
                  <div className="flex gap-4 justify-center">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={loading}
                    >
                      {selectedFile ? 'Bild ändern' : 'Bild auswählen'}
                    </Button>
                    {imagePreview && (
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                          setSelectedFile(null);
                          setImagePreview(coffee?.image_url || null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                          }
                        }}
                        disabled={loading}
                      >
                        Zurücksetzen
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              <p className="mt-4 text-sm text-[var(--color-text-secondary)]">
                Oder URL eingeben:
              </p>
              <Input
                label=""
                value={selectedFile ? '' : formData.image_url}
                onChange={(value) => {
                  if (!selectedFile) {
                    setFormData({ ...formData, image_url: value });
                    setImagePreview(value || null);
                  }
                }}
                placeholder={selectedFile ? 'Bild wurde hochgeladen - URL wird automatisch gesetzt' : 'https://...'}
                disabled={!!selectedFile}
              />
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="mb-6">Details</h2>
          <div className="space-y-4">
            <Input
              label="Röstgrad"
              value={formData.roast_level}
              onChange={(value) => setFormData({ ...formData, roast_level: value })}
            />
            <Input
              label="Verarbeitungsmethode"
              value={formData.processing_method}
              onChange={(value) => setFormData({ ...formData, processing_method: value })}
            />
            <Input
              label="Varietät"
              value={formData.varietal}
              onChange={(value) => setFormData({ ...formData, varietal: value })}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Höhe min (m)"
                type="number"
                value={formData.altitude_min}
                onChange={(value) => setFormData({ ...formData, altitude_min: value })}
              />
              <Input
                label="Höhe max (m)"
                type="number"
                value={formData.altitude_max}
                onChange={(value) => setFormData({ ...formData, altitude_max: value })}
              />
            </div>
            <Input
              label="Land"
              value={formData.country}
              onChange={(value) => setFormData({ ...formData, country: value })}
            />
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="block text-sm text-[var(--color-brown-light)] font-medium">Regionen</span>
                <Button type="button" variant="outline" size="sm" onClick={addRegionRow} disabled={loading}>
                  +
                </Button>
              </div>
              <div className="space-y-3">
                {selectedRegions.map((regionId, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <div className="flex-1">
                      <Select
                        value={regionId}
                        onChange={(value) => updateRegionAt(idx, value)}
                        options={regionOptions}
                      />
                    </div>
                    {selectedRegions.length > 1 && (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => removeRegionRow(idx)}
                        disabled={loading}
                      >
                        −
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card>
          <h2 className="mb-6">Geschmacksnoten</h2>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {(() => {
              const notesByCategory = new Map<string, { category: FlavorCategory | null; notes: FlavorNote[] }>();
              const uncategorized: FlavorNote[] = [];

              flavorNotes.forEach((note) => {
                if (note.category) {
                  const categoryId = note.category.id;
                  if (!notesByCategory.has(categoryId)) {
                    notesByCategory.set(categoryId, { category: note.category, notes: [] });
                  }
                  notesByCategory.get(categoryId)!.notes.push(note);
                } else {
                  uncategorized.push(note);
                }
              });

              const sortedCategories = Array.from(notesByCategory.values()).sort((a, b) => {
                if (!a.category || !b.category) return 0;
                const aParentName = a.category.parent?.name || '';
                const bParentName = b.category.parent?.name || '';
                if (aParentName !== bParentName) {
                  return aParentName.localeCompare(bParentName);
                }
                if (a.category.level !== b.category.level) return a.category.level - b.category.level;
                return a.category.name.localeCompare(b.category.name);
              });

              let currentParent: string | null = null;

              return (
                <>
                  {sortedCategories.map(({ category, notes }) => {
                    const parentName = category?.parent?.name || null;
                    const showParent = parentName && parentName !== currentParent;
                    if (showParent) {
                      currentParent = parentName;
                    }

                    return (
                      <div key={category?.id || 'uncategorized'} className="space-y-2">
                        {showParent && category?.parent && (
                          <h2 className="text-base font-bold text-[var(--color-brown)] mt-4 mb-2 sticky top-0 bg-white py-2 border-b border-[var(--color-beige)]">
                            {category.parent.name}
                          </h2>
                        )}
                        {category && (
                          <h3 className={`text-sm font-semibold text-[var(--color-brown)] mb-2 ${category.parent ? 'ml-4' : ''} sticky top-0 bg-white py-1`}>
                            {category.name}
                          </h3>
                        )}
                        <div className={`space-y-1 ${category?.parent ? 'ml-6' : 'ml-2'}`}>
                          {notes.map((note) => (
                            <label key={note.id} className="flex items-center gap-3 cursor-pointer hover:bg-[var(--color-beige-light)] p-2 rounded-lg transition-colors">
                              <input
                                type="checkbox"
                                checked={selectedFlavorNotes.includes(note.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedFlavorNotes([...selectedFlavorNotes, note.id]);
                                  } else {
                                    setSelectedFlavorNotes(selectedFlavorNotes.filter((id) => id !== note.id));
                                  }
                                }}
                                className="w-5 h-5 rounded border-2 border-[var(--color-beige)] text-[var(--color-brown)] focus:ring-2 focus:ring-[var(--color-brown)]"
                              />
                              <span>{note.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  {uncategorized.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold text-[var(--color-brown)] mb-2 sticky top-0 bg-white py-1">
                        Sonstiges
                      </h3>
                      <div className="space-y-1 ml-2">
                        {uncategorized.map((note) => (
                          <label key={note.id} className="flex items-center gap-3 cursor-pointer hover:bg-[var(--color-beige-light)] p-2 rounded-lg transition-colors">
                            <input
                              type="checkbox"
                              checked={selectedFlavorNotes.includes(note.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedFlavorNotes([...selectedFlavorNotes, note.id]);
                                } else {
                                  setSelectedFlavorNotes(selectedFlavorNotes.filter((id) => id !== note.id));
                                }
                              }}
                              className="w-5 h-5 rounded border-2 border-[var(--color-beige)] text-[var(--color-brown)] focus:ring-2 focus:ring-[var(--color-brown)]"
                            />
                            <span>{note.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </Card>

        <Card>
          <h2 className="mb-6">Zubereitungsmethoden</h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {brewMethods.map((method) => (
              <label key={method.id} className="flex items-center gap-3 cursor-pointer hover:bg-[var(--color-beige-light)] p-2 rounded-lg transition-colors">
                <input
                  type="checkbox"
                  checked={selectedBrewMethods.includes(method.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedBrewMethods([...selectedBrewMethods, method.id]);
                    } else {
                      setSelectedBrewMethods(selectedBrewMethods.filter((id) => id !== method.id));
                    }
                  }}
                  className="w-5 h-5 rounded border-2 border-[var(--color-beige)] text-[var(--color-brown)] focus:ring-2 focus:ring-[var(--color-brown)]"
                />
                <span>{method.name}</span>
              </label>
            ))}
          </div>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <div>
          {coffee && (
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
          {loading ? 'Speichern...' : coffee ? 'Aktualisieren' : 'Erstellen'}
        </Button>
      </div>
    </form>
  );
}

