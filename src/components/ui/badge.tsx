import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 shadow-md backdrop-blur-sm",
  {
    variants: {
      variant: {
        default: "border-primary/30 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg",
        secondary: "border-secondary/30 bg-secondary/80 backdrop-blur-md text-secondary-foreground shadow-md",
        destructive: "border-destructive/30 bg-gradient-to-r from-destructive to-destructive/90 text-destructive-foreground shadow-lg",
        outline: "border-primary/40 text-foreground bg-background/50 backdrop-blur-md shadow-sm",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
