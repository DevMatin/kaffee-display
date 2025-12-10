'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { FlavorCategory, FlavorNote } from '@/lib/types';

interface FlavorCategoryTableProps {
  categories: FlavorCategory[];
  flavorNotes?: FlavorNote[];
}

export function FlavorCategoryTable({ categories, flavorNotes = [] }: FlavorCategoryTableProps) {
  const byParent = new Map<string | null, FlavorCategory[]>();
  const notesByCategory = new Map<string, FlavorNote[]>();
  const uncategorized: FlavorNote[] = [];

  categories.forEach((cat) => {
    const key = cat.parent_id || null;
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key)!.push(cat);
  });

  byParent.forEach((list) => list.sort((a, b) => a.name.localeCompare(b.name)));

  flavorNotes.forEach((note) => {
    if (note.category_id) {
      if (!notesByCategory.has(note.category_id)) {
        notesByCategory.set(note.category_id, []);
      }
      notesByCategory.get(note.category_id)!.push(note);
    } else {
      uncategorized.push(note);
    }
  });

  notesByCategory.forEach((list) => list.sort((a, b) => a.name.localeCompare(b.name)));
  uncategorized.sort((a, b) => a.name.localeCompare(b.name));

  const renderRows = (parentId: string | null, depth = 0): React.ReactElement[] => {
    const list = byParent.get(parentId) || [];
    const rows: React.ReactElement[] = [];

    list.forEach((cat) => {
      rows.push(
        <tr
          key={cat.id}
          className="border-b border-[var(--color-beige)] hover:bg-[var(--color-beige-light)] transition-colors"
        >
          <td className="py-4 px-4 text-[var(--color-text-primary)]">
            <span className="inline-block" style={{ paddingLeft: `${depth * 20}px` }}>
              {depth > 0 && <span className="mr-2 text-[var(--color-text-muted)]">↳</span>}
              {cat.name}
            </span>
          </td>
          <td className="py-4 px-4 text-[var(--color-text-secondary)]">{cat.level}</td>
          <td className="py-4 px-4 text-[var(--color-text-secondary)]">{cat.parent?.name || '–'}</td>
          <td className="py-4 px-4">
            <div className="flex justify-end gap-2">
              <Link href={`/admin/aromen/kategorien/${cat.id}`}>
                <Button variant="outline" size="sm">
                  Bearbeiten
                </Button>
              </Link>
            </div>
          </td>
        </tr>
      );

      const notes = notesByCategory.get(cat.id) || [];
      notes.forEach((note) => {
        rows.push(
          <tr
            key={note.id}
            className="border-b border-[var(--color-beige)] hover:bg-[var(--color-beige-light)] transition-colors"
          >
            <td className="py-4 px-4 text-[var(--color-text-primary)]">
              <span className="inline-block" style={{ paddingLeft: `${(depth + 1) * 20}px` }}>
                <span className="mr-2 text-[var(--color-text-muted)]">•</span>
                {note.name}
              </span>
            </td>
            <td className="py-4 px-4 text-[var(--color-text-secondary)]">Note</td>
            <td className="py-4 px-4 text-[var(--color-text-secondary)]">{cat.name}</td>
            <td className="py-4 px-4">
              <div className="flex justify-end gap-2">
                <Link href={`/admin/aromen/${note.id}`}>
                  <Button variant="outline" size="sm">
                    Bearbeiten
                  </Button>
                </Link>
              </div>
            </td>
          </tr>
        );
      });

      rows.push(...renderRows(cat.id, depth + 1));
    });

    return rows;
  };

  return (
    <Card padding="lg">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-[var(--color-beige)]">
              <th className="text-left py-4 px-4 text-sm font-semibold text-[var(--color-text-muted)]">Name</th>
              <th className="text-left py-4 px-4 text-sm font-semibold text-[var(--color-text-muted)]">Ebene</th>
              <th className="text-left py-4 px-4 text-sm font-semibold text-[var(--color-text-muted)]">Überkategorie</th>
              <th className="text-right py-4 px-4 text-sm font-semibold text-[var(--color-text-muted)]">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {renderRows(null)}
            {uncategorized.length > 0 && (
              <>
                <tr className="border-b-2 border-[var(--color-beige)] bg-[var(--color-beige-light)]">
                  <td className="py-3 px-4 font-semibold text-[var(--color-brown)]">Ohne Kategorie</td>
                  <td className="py-3 px-4 text-[var(--color-text-secondary)]">Note</td>
                  <td className="py-3 px-4 text-[var(--color-text-secondary)]">–</td>
                  <td />
                </tr>
                {uncategorized.map((note) => (
                  <tr
                    key={note.id}
                    className="border-b border-[var(--color-beige)] hover:bg-[var(--color-beige-light)] transition-colors"
                  >
                    <td className="py-4 px-4 text-[var(--color-text-primary)]">
                      <span className="inline-block" style={{ paddingLeft: '20px' }}>
                        <span className="mr-2 text-[var(--color-text-muted)]">•</span>
                        {note.name}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-[var(--color-text-secondary)]">Note</td>
                    <td className="py-4 px-4 text-[var(--color-text-secondary)]">–</td>
                    <td className="py-4 px-4">
                      <div className="flex justify-end gap-2">
                        <Link href={`/admin/aromen/${note.id}`}>
                          <Button variant="outline" size="sm">
                            Bearbeiten
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </>
            )}
          </tbody>
        </table>
        {categories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[var(--color-text-secondary)]">Noch keine Kategorien vorhanden.</p>
          </div>
        )}
      </div>
    </Card>
  );
}

