import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/my-lawyer/utils";

/**
 * Button variants using class-variance-authority for consistent styling.
 * Court-themed variants with gold/amber accents.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:w-4 [&_svg]:h-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-b from-amber-500 to-amber-600 text-slate-900 shadow-sm hover:from-amber-400 hover:to-amber-500 active:from-amber-600 active:to-amber-700",
        primary:
          "bg-slate-900 text-white shadow-sm hover:bg-slate-800 active:bg-slate-950",
        destructive:
          "bg-red-600 text-white shadow-sm hover:bg-red-500 active:bg-red-700",
        outline:
          "border border-amber-600 bg-transparent text-amber-700 hover:bg-amber-600 hover:text-white active:bg-amber-700",
        secondary:
          "bg-stone-100 text-slate-900 shadow-sm hover:bg-stone-200 active:bg-stone-300",
        ghost:
          "text-slate-700 hover:bg-stone-100 hover:text-slate-900 active:bg-stone-200",
        link: "text-amber-600 underline-offset-4 hover:underline hover:text-amber-700",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3 text-xs",
        lg: "h-11 px-8 text-base",
        icon: "h-10 w-10",
      },
      rounded: {
        default: "",
        full: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      rounded: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  rounded?: "default" | "full";
}

/**
 * Button component with court-themed styling.
 * Supports multiple variants and sizes with consistent focus states.
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, rounded, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, rounded, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
