import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export type BottomNavItem = {
  id: string;
  label: string;
  icon: ReactNode;
};

interface Props {
  items: BottomNavItem[];
  active: string;
  onSelect: (id: string) => void;
}

export function BottomNav({ items, active, onSelect }: Props) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-border/60 bg-background/80 backdrop-blur-md z-50">
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between gap-2">
        {items.map(item => (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={cn(
              "flex-1 flex flex-col items-center justify-center gap-1 text-xs font-medium py-2 rounded-xl transition-all",
              active === item.id
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <span className="text-base">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
