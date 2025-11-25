import { ArrowUpRight, MapPin } from "lucide-react";
import { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";
import { ProgressBar } from "./progress-bar";

interface MissionCardProps {
  title: string;
  description: string;
  progress: number;
  location?: string;
  actions?: ReactNode;
  accent?: ReactNode;
}

export function MissionCard({ title, description, progress, location, actions, accent }: MissionCardProps) {
  return (
    <Card className="gap-4 border-primary/20 bg-gradient-to-br from-card/90 via-card/70 to-primary/5">
      <CardHeader className="px-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-lg leading-tight">{title}</CardTitle>
            <CardDescription className="text-sm leading-relaxed">{description}</CardDescription>
            {location && (
              <p className="flex items-center gap-1.5 text-xs text-primary">
                <MapPin className="size-4" />
                {location}
              </p>
            )}
          </div>
          {accent ?? <ArrowUpRight className="size-5 text-primary" />}
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-2 space-y-3">
        <ProgressBar progress={progress} />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Progresso</span>
          <span className="font-semibold text-primary">{progress}%</span>
        </div>
      </CardContent>
      {actions && <div className="px-5 pb-5">{actions}</div>}
    </Card>
  );
}
