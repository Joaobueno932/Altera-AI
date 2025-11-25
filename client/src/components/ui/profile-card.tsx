import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";
import { Button } from "./button";
import { BadgeCheck } from "lucide-react";

interface ProfileCardProps {
  name: string;
  role?: string;
  avatarUrl?: string;
  status?: string;
  onAction?: () => void;
  actionLabel?: string;
}

export function ProfileCard({ name, role, avatarUrl, status, onAction, actionLabel = "Abrir" }: ProfileCardProps) {
  return (
    <Card className="border-primary/15 bg-gradient-to-br from-card/90 via-card/70 to-secondary/5">
      <CardHeader className="flex-row items-center gap-4 px-5">
        <Avatar>
          {avatarUrl ? (
            <AvatarImage src={avatarUrl} alt={name} />
          ) : (
            <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
          )}
        </Avatar>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg leading-tight">{name}</CardTitle>
            <BadgeCheck className="size-4 text-primary" />
          </div>
          {role && <CardDescription className="text-sm">{role}</CardDescription>}
          {status && <p className="text-xs text-primary/80">{status}</p>}
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        <Button className="w-full" variant="filled" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      </CardContent>
    </Card>
  );
}
