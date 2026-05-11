import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-marigold-deep focus-visible:outline-offset-2",
  {
    variants: {
      variant: {
        primary: "bg-ink text-cream hover:bg-charcoal active:scale-[0.98]",
        marigold: "bg-marigold text-ink hover:bg-marigold-deep hover:text-cream active:scale-[0.98]",
        secondary: "border border-line-strong bg-cream text-ink hover:bg-card",
        ghost: "text-ink hover:bg-line/50",
        danger: "bg-coral text-cream hover:opacity-90",
        link: "text-ink underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-9 px-3 text-sm rounded-md",
        md: "h-11 px-5 text-sm rounded-lg",
        lg: "h-14 px-7 text-base rounded-xl",
        xl: "h-16 px-8 text-lg rounded-2xl",
        icon: "h-10 w-10 rounded-md",
      },
      fullWidth: { true: "w-full" },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp ref={ref} className={cn(buttonVariants({ variant, size, fullWidth }), className)} {...props} />;
  }
);
Button.displayName = "Button";

export { buttonVariants };
