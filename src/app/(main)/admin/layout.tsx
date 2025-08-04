import { AdminAccessGuard } from "./_components/AdminAccessGuard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAccessGuard>
      <div className="min-h-screen bg-background">{children}</div>
    </AdminAccessGuard>
  );
}
