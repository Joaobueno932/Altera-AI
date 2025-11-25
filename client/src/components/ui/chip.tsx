import { cn } from "@/lib/utils";
import { ComponentProps } from "react";

export function Chip({ className, ...props }: ComponentProps<"button">) {
  return (
    <button
      className={cn(
        "px-4 py-3 rounded-full bg-muted/60 text-foreground text-sm font-medium",
        "border border-border/60 backdrop-blur transition-all duration-200",
        "active:scale-95 hover:border-primary/50 hover:bg-primary/10",
        className
      )}
      {...props}
    />
  );
}
