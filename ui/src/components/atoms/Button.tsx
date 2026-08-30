import Link from "next/link";
import type { ButtonHTMLAttributes } from "react";
import { Spinner } from "@/components/atoms/Spinner";

type Variant = "primary" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-brand text-white hover:bg-brand-strong",
  outline:
    "border border-zinc-700 bg-white/5 text-zinc-100 hover:border-zinc-500 hover:bg-white/10",
  ghost: "text-zinc-400 hover:bg-white/10 hover:text-zinc-100",
};

const SIZES: Record<Size, string> = {
  sm: "h-8 rounded-lg px-3 text-xs",
  md: "h-10 rounded-lg px-4 text-sm",
  lg: "h-12 rounded-xl px-6 text-base",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  href?: string;
  loading?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  href,
  loading = false,
  className = "",
  children,
  disabled,
  ...rest
}: ButtonProps) {
  const classes = `inline-flex items-center justify-center gap-2 font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:pointer-events-none disabled:opacity-60 ${VARIANTS[variant]} ${SIZES[size]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} disabled={disabled || loading} {...rest}>
      {loading && <Spinner className="size-4" />}
      {children}
    </button>
  );
}
