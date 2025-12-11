import { getTranslations } from "next-intl/server";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Link } from "@/lib/i18n-utils";
import { locales } from "@/i18n";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const dynamic = 'force-dynamic';
export const prerender = false;

export default async function HomePage() {
  const t = await getTranslations("home");
  const nav = await getTranslations("navigation");

  return (
    <PageContainer>
      <div className="text-center py-16">
        <h1 className="mb-6">{t("welcome")}</h1>
        <p className="text-[var(--color-text-secondary)] mb-12 max-w-2xl mx-auto">
          {t("heroBody")}
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/kaffees">
            <Button size="lg">{nav("browseCoffees")}</Button>
          </Link>
          <Link href="/regionen">
            <Button variant="secondary" size="lg">
              {nav("exploreRegions")}
            </Button>
          </Link>
        </div>
      </div>
    </PageContainer>
  );
}

