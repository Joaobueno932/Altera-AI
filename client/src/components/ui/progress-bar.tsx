interface Props {
  progress: number;
}

export function ProgressBar({ progress }: Props) {
  return (
    <div className="w-full h-3 rounded-full bg-muted/60 overflow-hidden backdrop-blur-md border border-border/70">
      <div
        className="h-full bg-gradient-to-r from-primary via-secondary to-accent transition-all duration-500 shadow-inner"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
