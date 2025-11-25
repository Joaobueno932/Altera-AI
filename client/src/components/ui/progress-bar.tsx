interface Props {
  progress: number;
}

export function ProgressBar({ progress }: Props) {
  return (
    <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
