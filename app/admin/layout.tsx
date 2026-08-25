import { AdminStyleGuard } from '@/components/admin/AdminStyleGuard';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-app="admin">
      <AdminStyleGuard />
      {children}
    </div>
  );
}
