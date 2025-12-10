import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { ADMIN_AUTH_COOKIE, isValidAdminToken } from '@/lib/admin-auth';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
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


