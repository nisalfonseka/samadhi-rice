import { basePriceFor, applyDiscount, formatLKR } from "@/lib/pricing";
import { cn } from "@/lib/utils";

/** Shows the net price (large) and, when applicable, the struck-through base
 *  price + "X% off" pill. Used on cards and the buy panel. */
export default function PriceBlock({
  pricePerKg,
  weight,
  discountPercent,
  quantity = 1,
  size = "md",
  tone = "dark",
  className,
}: {
  pricePerKg: number;
  weight: number;
  discountPercent: number;
  quantity?: number;
  size?: "sm" | "md" | "lg";
  /** "dark" = ink on paper; "light" = paper on dark surfaces (carousel, footer). */
  tone?: "dark" | "light";
  className?: string;
}) {
  const base = basePriceFor(pricePerKg, weight) * quantity;
  const net = applyDiscount(base, discountPercent);
  const hasDiscount = discountPercent > 0 && net < base;

  const sizes = {
    sm: { net: "text-lg", base: "text-xs", pill: "text-[0.6rem]" },
    md: { net: "text-2xl", base: "text-sm", pill: "text-[0.65rem]" },
    lg: { net: "text-3xl", base: "text-sm", pill: "text-[0.7rem]" },
  }[size];

  const colors =
    tone === "light"
      ? { net: "text-rice-50", base: "text-rice-100/55" }
      : { net: "text-husk", base: "text-husk-soft/80" };

  return (
    <div className={cn("flex items-baseline gap-2", className)}>
      <span
        className={cn(
          "font-display animate-[rise_0.35s_ease]",
          sizes.net,
          colors.net,
        )}
      >
        {formatLKR(net)}
      </span>
      {hasDiscount && (
        <>
          <span className={cn("line-through", sizes.base, colors.base)}>
            {formatLKR(base)}
          </span>
          <span
            className={cn(
              "rounded-full bg-clay-500 px-1.5 py-0.5 font-semibold uppercase tracking-wider text-rice-50",
              sizes.pill,
            )}
          >
            −{discountPercent}%
          </span>
        </>
      )}
    </div>
  );
}
