import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-full",
  {
    variants: {
      variant: {
        default: "bg-line text-slate",
        marigold: "bg-marigold/30 text-marigold-deep",
        sage: "bg-sage/25 text-emerald-900",
        coral: "bg-coral/25 text-red-900",
        outline: "border border-line-strong text-slate",
        verified: "bg-sage/15 text-emerald-800 border border-sage/30",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
