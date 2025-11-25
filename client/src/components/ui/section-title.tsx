import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface SectionTitleProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function SectionTitle({ eyebrow, title, subtitle, icon, action, className }: SectionTitleProps) {
  return (
    <div
      className={cn(
        "flex w-full items-start justify-between gap-3 rounded-2xl bg-card/50 px-4 py-3 backdrop-blur",
        "border border-border/60 shadow-inner shadow-primary/5",
        className
      )}
    >
      <div className="space-y-1">
        {eyebrow && <p className="text-[11px] uppercase tracking-[0.2em] text-primary">{eyebrow}</p>}
        <div className="flex items-center gap-2 text-lg font-semibold">
          {icon && <span className="text-primary" aria-hidden>{icon}</span>}
          <span>{title}</span>
        </div>
        {subtitle && <p className="text-sm text-muted-foreground leading-relaxed">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
