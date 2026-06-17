import Link from "next/link";
import { cn } from "@/lib/utils";

export default function SectionHeading({
  kicker,
  title,
  intro,
  align = "left",
  tone = "dark",
  link,
  className,
}: {
  kicker: string;
  title: React.ReactNode;
  intro?: string;
  align?: "left" | "center";
  tone?: "dark" | "light";
  link?: { label: string; href: string };
  className?: string;
}) {
  const isLight = tone === "light";
  return (
    <div
      className={cn(
        "flex w-full gap-6",
        align === "center"
          ? "flex-col items-center text-center"
          : "flex-col items-start md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        <p
          className={cn(
            "kicker mb-4 flex items-center gap-3",
            align === "center" && "justify-center",
            isLight ? "text-harvest-300" : "text-clay-500",
          )}
        >
          <span
            className={cn(
              "h-px w-8",
              isLight ? "bg-harvest-400/60" : "bg-clay-400/50",
            )}
          />
          {kicker}
        </p>
        <h2
          className={cn(
            "font-display text-[clamp(2rem,4.5vw,3.4rem)] font-medium",
            isLight ? "text-rice-50" : "text-husk",
          )}
        >
          {title}
        </h2>
        {intro && (
          <p
            className={cn(
              "mt-5 text-[1.02rem] leading-relaxed",
              isLight ? "text-rice-100/75" : "text-husk-soft",
            )}
          >
            {intro}
          </p>
        )}
      </div>

      {link && (
        <Link
          href={link.href}
          className={cn(
            "group inline-flex shrink-0 items-center gap-2 text-sm font-semibold uppercase tracking-widest",
            isLight ? "text-harvest-300" : "text-paddy-700",
          )}
        >
          {link.label}
          <span className="transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </Link>
      )}
    </div>
  );
}
