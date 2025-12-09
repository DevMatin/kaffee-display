'use client';

import { useState, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

type PreviewRow = Record<string, string>;

export function CSVImportForm() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<PreviewRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ row: number; message: string }[]>([]);

  const parsePreview = useCallback(async (f: File) => {
    const text = await f.text();
    const parsed = parseCsvPreview(text);
    setPreview(parsed.slice(0, 5));
  }, []);

  const handleFile = useCallback(
    async (f: File | null) => {
      setFile(f);
      setPreview([]);
      if (f) await parsePreview(f);
    },
    [parsePreview]
  );

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const onSubmit = async () => {
    if (!file) return;
    setLoading(true);
    setMessage(null);
    setErrors([]);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/import-csv', { method: 'POST', body: form });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Import fehlgeschlagen');
      setMessage(`Import fertig: ${json.successCount} ok, ${json.errorCount} Fehler`);
      setErrors(json.errors || []);
    } catch (err: any) {
      setMessage(err?.message || 'Fehler beim Import');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <div
        className="border-2 border-dashed rounded-xl p-6 mb-4 text-center cursor-pointer bg-[var(--color-cream)] hover:bg-[var(--color-beige-light)]"
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        onClick={() => document.getElementById('csv-input')?.click()}
      >
        <p className="font-medium">CSV per Drag & Drop ablegen oder klicken zum Auswählen</p>
        {file && <p className="text-sm mt-2 text-[var(--color-text-secondary)]">{file.name}</p>}
      </div>
      <input
        id="csv-input"
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0] || null)}
      />

      {preview.length > 0 && (
        <div className="mb-4">
          <h3 className="mb-2">Vorschau (erste Zeilen)</h3>
          <div className="overflow-auto border border-[var(--color-border)] rounded-lg">
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  {Object.keys(preview[0]).map((h) => (
                    <th key={h} className="px-3 py-2 bg-[var(--color-beige-light)] text-left">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.map((row, idx) => (
                  <tr key={idx} className="border-t border-[var(--color-border)]">
                    {Object.keys(preview[0]).map((h) => (
                      <td key={h} className="px-3 py-2 align-top">
                        {row[h]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <Button onClick={onSubmit} disabled={!file || loading}>
          {loading ? 'Import läuft...' : 'Import starten'}
        </Button>
        {message && <span className="text-sm text-[var(--color-text-secondary)]">{message}</span>}
      </div>

      {errors.length > 0 && (
        <div className="mt-4 text-sm text-red-600">
          <p>Fehler:</p>
          <ul className="list-disc list-inside">
            {errors.slice(0, 10).map((e, idx) => (
              <li key={idx}>
                Zeile {e.row}: {e.message}
              </li>
            ))}
            {errors.length > 10 && <li>… weitere {errors.length - 10} Fehler</li>}
          </ul>
        </div>
      )}
    </Card>
  );
}

function parseCsvPreview(text: string): PreviewRow[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  const pushField = () => {
    row.push(field);
    field = '';
  };
  const pushRow = () => {
    rows.push(row);
    row = [];
  };

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (inQuotes && text[i + 1] === '"') {
        field += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      pushField();
    } else if ((c === '\n' || c === '\r') && !inQuotes) {
      pushField();
      if (row.length > 0) pushRow();
      if (c === '\r' && text[i + 1] === '\n') i++;
    } else {
      field += c;
    }
  }
  pushField();
  if (row.length > 0) pushRow();

  if (!rows.length) return [];
  const headers = rows[0];
  const dataRows = rows.slice(1).filter((r) => r.some((v) => v && v.trim() !== ''));

  return dataRows.map((cols) => {
    const rec: PreviewRow = {};
    headers.forEach((h, idx) => {
      rec[h] = cols[idx] ?? '';
    });
    return rec;
  });
}

