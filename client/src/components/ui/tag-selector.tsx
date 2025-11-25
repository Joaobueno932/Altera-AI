import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { ReactNode } from "react";
import { Button } from "./button";

export type TagOption = {
  label: string;
  value: string;
  icon?: ReactNode;
  hint?: string;
};

interface TagSelectorProps {
  options: TagOption[];
  value: string[];
  onChange: (values: string[]) => void;
  multiple?: boolean;
  className?: string;
}

export function TagSelector({ options, value, onChange, multiple = false, className }: TagSelectorProps) {
  const handleToggle = (optionValue: string) => {
    if (multiple) {
      onChange(
        value.includes(optionValue)
          ? value.filter(item => item !== optionValue)
          : [...value, optionValue]
      );
    } else {
      onChange([optionValue]);
    }
  };

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {options.map(option => {
        const isActive = value.includes(option.value);
        return (
          <Button
            key={option.value}
            type="button"
            variant="tag"
            size="sm"
            className={cn(
              "group flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-sm transition-transform duration-200",
              isActive
                ? "bg-primary/15 text-primary ring-2 ring-primary/30"
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => handleToggle(option.value)}
          >
            {option.icon && <span className="text-primary">{option.icon}</span>}
            <span className="font-medium">{option.label}</span>
            {isActive && <Check className="size-4" />}
            {option.hint && (
              <span className="text-[11px] font-semibold uppercase tracking-wide text-primary/70">
                {option.hint}
              </span>
            )}
          </Button>
        );
      })}
    </div>
  );
}
