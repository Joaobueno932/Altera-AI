import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface MobileContainerProps {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  hasBottomNav?: boolean;
}

export function MobileContainer({
  children,
  className,
  contentClassName,
  hasBottomNav = false,
}: MobileContainerProps) {
  return (
    <div
      className={cn(
        "min-h-screen bg-background text-foreground",
        "bg-[radial-gradient(circle_at_12%_20%,rgba(100,181,246,0.08),transparent_30%),radial-gradient(circle_at_82%_8%,rgba(76,29,149,0.12),transparent_28%),radial-gradient(circle_at_50%_80%,rgba(76,175,80,0.08),transparent_35%),#0b1220]",
        className
      )}
    >
      <div
        className={cn(
          "mx-auto flex w-full max-w-md flex-col gap-5 px-4 pt-6 sm:px-6 sm:pt-8",
          hasBottomNav ? "pb-28 sm:pb-32" : "pb-16 sm:pb-24",
          contentClassName
        )}
      >
        {children}
      </div>
    </div>
  );
}
