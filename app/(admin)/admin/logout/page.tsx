import { redirect } from 'next/navigation';

export default function AdminLogoutRedirect() {
  redirect('/admin/kaffees');
}


