import { Lightbulb } from "lucide-react";
import { ReactNode } from "react";

interface InsightBubbleProps {
  title: string;
  description?: string;
  icon?: ReactNode;
}

export function InsightBubble({ title, description, icon }: InsightBubbleProps) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm shadow-sm shadow-primary/10">
      <div className="mt-1 flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary shadow-inner shadow-primary/20">
        {icon ?? <Lightbulb className="size-4" />}
      </div>
      <div className="space-y-1">
        <p className="text-base font-semibold leading-tight">{title}</p>
        {description && <p className="text-muted-foreground leading-relaxed">{description}</p>}
      </div>
    </div>
  );
}
