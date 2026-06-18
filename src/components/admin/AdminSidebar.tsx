"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/ui/Logo";
import SignOutButton from "@/components/auth/SignOutButton";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Overview", href: "/admin", exact: true, icon: "M4 13h6V4H4v9Zm0 7h6v-5H4v5Zm10 0h6V11h-6v9Zm0-16v5h6V4h-6Z" },
  { label: "Analytics", href: "/admin/analytics", icon: "M4 19V5M4 19h16M8 16V9M12 16v-4M16 16V7M20 16v-2" },
  { label: "Products", href: "/admin/products", icon: "M3 7l9-4 9 4-9 4-9-4Zm0 5l9 4 9-4M3 17l9 4 9-4" },
  { label: "Categories", href: "/admin/categories", icon: "M4 5h7v6H4zM13 5h7v6h-7zM4 13h7v6H4zM13 13h7v6h-7z" },
  { label: "Orders", href: "/admin/orders", icon: "M6 2h9l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Zm8 1v5h5M8 13h8M8 17h6" },
  { label: "Customers", href: "/admin/customers", icon: "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 9c0-3.9 3.1-7 7-7s7 3.1 7 7M17 11a3 3 0 1 0 0-6M22 20c0-3-1.6-5.5-4-6.3" },
  { label: "Reviews", href: "/admin/reviews", icon: "M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9 6.8 19.6l1-5.8L3.5 9.7l5.9-.9z" },
  { label: "Blog", href: "/admin/blog", icon: "M4 4h12l4 4v12a0 0 0 0 1 0 0H4ZM16 4v4h4M7 12h10M7 16h7M7 8h5" },
  { label: "Settings", href: "/admin/settings", icon: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8-3a8 8 0 0 0-.1-1.3l2-1.6-2-3.4-2.4 1a8 8 0 0 0-2.2-1.3L13 2h-4l-.3 2.6A8 8 0 0 0 6.5 6l-2.4-1-2 3.4 2 1.6A8 8 0 0 0 4 12c0 .4 0 .9.1 1.3l-2 1.6 2 3.4 2.4-1c.7.5 1.4 1 2.2 1.3L9 22h4l.3-2.6c.8-.3 1.5-.7 2.2-1.3l2.4 1 2-3.4-2-1.6c.1-.4.1-.9.1-1.3Z" },
];

export default function AdminSidebar({ user }: { user: string }) {
  const pathname = usePathname();
  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <aside className="fixed inset-x-0 top-0 z-40 border-b border-husk/10 bg-rice-50 lg:inset-y-0 lg:right-auto lg:w-64 lg:border-b-0 lg:border-r">
      <div className="flex h-16 items-center justify-between px-5 lg:h-auto lg:flex-col lg:items-stretch lg:gap-0 lg:px-0 lg:py-0">
        <div className="flex items-center gap-3 lg:border-b lg:border-husk/10 lg:px-6 lg:py-5">
          <Link href="/admin"><Logo /></Link>
          <span className="hidden rounded-full bg-paddy-800/10 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-widest text-paddy-700 lg:inline">
            Admin
          </span>
        </div>

        {/* nav */}
        <nav className="no-scrollbar flex items-center gap-1 overflow-x-auto lg:mt-4 lg:flex-col lg:items-stretch lg:gap-1 lg:overflow-visible lg:px-3">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive(item.href, item.exact)
                  ? "bg-paddy-800 text-rice-50"
                  : "text-husk-soft hover:bg-husk/5 hover:text-husk",
              )}
            >
              <svg viewBox="0 0 24 24" className="h-[1.15rem] w-[1.15rem]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d={item.icon} />
              </svg>
              <span className="hidden sm:inline">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* footer */}
        <div className="hidden lg:mt-auto lg:block lg:border-t lg:border-husk/10 lg:px-5 lg:py-5">
          <p className="mb-3 truncate text-xs text-husk-soft">
            Signed in as <span className="font-medium text-husk">{user}</span>
          </p>
          <div className="flex flex-col gap-2">
            <Link
              href="/"
              className="rounded-full border border-husk/15 px-4 py-2 text-center text-sm font-medium text-husk transition-colors hover:border-paddy-600"
            >
              View store ↗
            </Link>
            <SignOutButton className="rounded-full border border-husk/15 px-4 py-2 text-center text-sm font-medium text-husk transition-colors hover:border-clay-500 hover:text-clay-600" />
          </div>
        </div>

        {/* mobile sign out */}
        <div className="lg:hidden">
          <SignOutButton className="rounded-full border border-husk/15 px-3 py-1.5 text-xs font-medium text-husk" />
        </div>
      </div>
    </aside>
  );
}
