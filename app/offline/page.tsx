"use client";

import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function OfflinePage() {
  return (
    <PageContainer>
      <div className="max-w-2xl mx-auto text-center space-y-6 py-12">
        <h1>Offline-Modus</h1>
        <p className="text-[var(--color-text-secondary)]">
          Du bist gerade offline. Zuletzt besuchte Seiten und Bilder bleiben verfügbar.
        </p>

        <Card padding="lg" className="space-y-4">
          <p className="text-[var(--color-text-secondary)]">
            Verbinde dich erneut, um aktuelle Daten zu laden oder die App zu aktualisieren.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button onClick={() => window.location.reload()}>Erneut versuchen</Button>
            <Link href="/kaffees">
              <Button variant="secondary">Zu Kaffees</Button>
            </Link>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}

