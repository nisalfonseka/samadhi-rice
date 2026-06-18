import Link from "next/link";
import Logo from "@/components/ui/Logo";

export default function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="bg-paper grid min-h-screen place-items-center px-5 py-28">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Link href="/" aria-label="SamadhiRice.lk home">
            <Logo />
          </Link>
        </div>
        <div className="rounded-3xl border border-husk/10 bg-rice-50 p-7 shadow-[0_24px_60px_-34px_rgba(34,31,23,0.5)] sm:p-9">
          <h1 className="font-display text-3xl text-husk">{title}</h1>
          <p className="mt-2 text-sm text-husk-soft">{subtitle}</p>
          <div className="mt-7">{children}</div>
        </div>
        <p className="mt-6 text-center text-sm text-husk-soft">{footer}</p>
      </div>
    </div>
  );
}
