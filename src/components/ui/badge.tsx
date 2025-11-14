import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 shadow-md backdrop-blur-sm",
  {
    variants: {
      variant: {
        default: "border-primary/30 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:from-primary/95 hover:to-primary shadow-lg hover:shadow-xl hover:scale-105",
        secondary: "border-secondary/30 bg-secondary/80 backdrop-blur-md text-secondary-foreground hover:bg-secondary shadow-md",
        destructive: "border-destructive/30 bg-gradient-to-r from-destructive to-destructive/90 text-destructive-foreground hover:from-destructive/95 hover:to-destructive shadow-lg",
        outline: "border-primary/40 text-foreground bg-background/50 backdrop-blur-md hover:bg-primary/10 hover:border-primary/60 shadow-sm hover:shadow-md",
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
