import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { ADMIN_AUTH_COOKIE, isValidAdminToken } from '@/lib/admin-auth';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!process.env.ADMIN_PASSWORD) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] p-8">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-semibold text-[var(--color-espresso)]">
            Konfigurationsfehler
          </h1>
          <p className="text-[var(--color-text-secondary)]">
            Der Admin-Bereich ist nicht konfiguriert. Bitte setze die ADMIN_PASSWORD Environment Variable.
          </p>
        </div>
      </div>
    );
  }

  const token = (await cookies()).get(ADMIN_AUTH_COOKIE.name)?.value;
  if (!isValidAdminToken(token)) {
    redirect('/admin/login');
  }
  
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 bg-[var(--color-background)]">
        {children}
      </main>
    </div>
  );
}


