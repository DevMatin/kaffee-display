"use client";

import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useTranslations } from "next-intl";

export function OfflinePageContent() {
  const t = useTranslations("offline");
  return (
    <PageContainer>
      <div className="max-w-2xl mx-auto text-center space-y-6 py-12">
        <h1>{t("title")}</h1>
        <p className="text-[var(--color-text-secondary)]">{t("body")}</p>

        <Card padding="lg" className="space-y-4">
          <p className="text-[var(--color-text-secondary)]">{t("hint")}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button onClick={() => window.location.reload()}>{t("retry")}</Button>
            <Link href="/kaffees">
              <Button variant="secondary">{t("toCoffees")}</Button>
            </Link>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}
