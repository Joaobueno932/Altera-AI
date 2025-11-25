import { cn } from "@/lib/utils";
import { ComponentProps } from "react";

export function MobileCard({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-card/80 border border-border/60 backdrop-blur-md shadow-lg p-4",
        "transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/60",
        className
      )}
      {...props}
    />
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-lg font-semibold text-foreground/90 mb-2">{children}</h3>;
}
