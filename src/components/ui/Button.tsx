import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const base =
  "group/btn inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-wide transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-harvest-400 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:cursor-not-allowed disabled:opacity-50";

const sizes = {
  sm: "px-4 py-2 text-[0.8rem]",
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-4 text-[0.95rem]",
} as const;

const variants = {
  solid:
    "bg-paddy-800 text-rice-50 hover:bg-paddy-900 shadow-[0_14px_34px_-16px_rgba(29,41,22,0.85)] hover:-translate-y-0.5",
  gold:
    "bg-harvest-500 text-paddy-950 hover:bg-harvest-400 shadow-[0_14px_34px_-16px_rgba(199,154,59,0.95)] hover:-translate-y-0.5",
  outline:
    "border border-current/30 hover:bg-current/[0.06]",
  light:
    "bg-rice-50 text-paddy-900 hover:bg-white shadow-[0_14px_34px_-16px_rgba(0,0,0,0.5)] hover:-translate-y-0.5",
  ghost: "hover:bg-current/[0.06]",
} as const;

type ButtonProps = {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  className?: string;
  children: ReactNode;
  href?: string;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  "aria-label"?: string;
  disabled?: boolean;
};

export default function Button({
  variant = "solid",
  size = "md",
  className,
  children,
  href,
  type = "button",
  onClick,
  disabled,
  ...rest
}: ButtonProps) {
  const classes = cn(base, sizes[size], variants[variant], className);

  if (href) {
    return (
      <Link href={href} className={classes} onClick={onClick} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
}
