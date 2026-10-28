import type { ComponentProps } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "md" | "sm";

const variants: Record<Variant, string> = {
  primary: "bg-cobalt text-paper hover:bg-cobalt/90",
  secondary: "bg-paper text-ink border border-line hover:bg-wall",
  danger: "bg-brick text-paper hover:bg-brick/90",
  ghost: "text-graphite hover:bg-wall hover:text-ink",
};

const sizes: Record<Size, string> = {
  md: "h-10 px-4 text-body",
  sm: "h-8 px-3 text-meta",
};

// Shared with links that look like buttons.
export function buttonClasses(variant: Variant = "primary", size: Size = "md") {
  return `inline-flex shrink-0 items-center justify-center gap-1.5 rounded-field font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${sizes[size]}`;
}

type ButtonProps = ComponentProps<"button"> & {
  variant?: Variant;
  size?: Size;
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button type={type} className={`${buttonClasses(variant, size)} ${className}`} {...props} />
  );
}
