import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface MobileContainerProps {
  children: ReactNode;
  className?: string;
}

export function MobileContainer({ children, className }: MobileContainerProps) {
  return (
    <div
      className={cn(
        "min-h-screen bg-background text-foreground",
        "bg-[radial-gradient(circle_at_12%_20%,rgba(100,181,246,0.08),transparent_30%),radial-gradient(circle_at_82%_8%,rgba(76,29,149,0.12),transparent_28%),radial-gradient(circle_at_50%_80%,rgba(76,175,80,0.08),transparent_35%),#0b1220]",
        className
      )}
    >
      <div className="mx-auto flex w-full max-w-md flex-col px-4 pb-28 pt-4 sm:px-6 sm:pt-8 sm:pb-32 gap-5">
        {children}
      </div>
    </div>
  );
}
