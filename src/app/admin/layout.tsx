import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/admin-guard";
import AdminSidebar from "@/components/admin/AdminSidebar";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdminPage();

  return (
    <div className="min-h-screen bg-rice-100">
      <AdminSidebar user={session.user.name ?? session.user.email ?? "Admin"} />
      <div className="pt-16 lg:pl-64 lg:pt-0">
        <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
          {children}
        </div>
      </div>
    </div>
  );
}
