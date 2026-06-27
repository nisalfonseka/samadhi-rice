import { basePriceFor, applyDiscount, formatLKR } from "@/lib/pricing";
import { cn } from "@/lib/utils";

/** Shows the net price. The struck-through original price (if any) is
 *  rendered separately, as a per-kg line, by the caller. */
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

  const sizes = {
    sm: "text-base sm:text-lg",
    md: "text-lg sm:text-2xl",
    lg: "text-2xl sm:text-3xl",
  }[size];

  const color = tone === "light" ? "text-rice-50" : "text-husk";

  return (
    <div className={cn("flex items-baseline gap-2", className)}>
      <span className={cn("font-display animate-[rise_0.35s_ease]", sizes, color)}>
        {formatLKR(net)}
      </span>
    </div>
  );
}
